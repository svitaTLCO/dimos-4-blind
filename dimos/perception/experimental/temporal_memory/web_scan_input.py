from __future__ import annotations

import base64
import binascii
import io
import os
import threading
import time
from collections import deque
from dataclasses import dataclass
from typing import Any

from fastapi import FastAPI, Header, HTTPException
import numpy as np
from pydantic import BaseModel
from PIL import Image as PILImage
import uvicorn

from dimos.agents.annotation import skill
from dimos.core.core import rpc
from dimos.core.module import Module
from dimos.core.stream import Out
from dimos.msgs.geometry_msgs.PoseStamped import PoseStamped
from dimos.msgs.geometry_msgs.Transform import Transform
from dimos.msgs.geometry_msgs.Vector3 import Vector3
from dimos.msgs.sensor_msgs import CameraInfo, Image
from dimos.msgs.sensor_msgs.Image import ImageFormat

MAX_PAYLOAD_BYTES = 2_500_000
RATE_LIMIT_PER_SEC = 5
app = FastAPI()
app.state.publisher = None


class WebScanFrame(BaseModel):
    image_b64: str
    frame_id: str = "ios_camera"
    ts: float | None = None
    room_id: str | None = None


class WebScanSessionCreate(BaseModel):
    session_id: str | None = None
    place_name: str | None = None
    description: str | None = None


class WebScanSessionEvent(BaseModel):
    event_type: str
    room_id: str | None = None
    note: str | None = None
    ts: float | None = None


@dataclass
class SessionState:
    session_id: str
    place_name: str | None
    description: str | None
    started_at: float
    finished_at: float | None = None
    frames_received: int = 0
    last_frame_at: float | None = None
    rooms: list[dict[str, Any]] | None = None
    events: list[dict[str, Any]] | None = None
    status: str = "running"

    def __post_init__(self) -> None:
        self.rooms = self.rooms or []
        self.events = self.events or []


@app.get("/webscan/health")
async def health() -> dict[str, Any]:
    return {"ok": True}


@app.get("/webscan/status")
async def status() -> dict[str, Any]:
    p: WebScanInput | None = app.state.publisher
    return p.status_dict() if p else {"ok": False}


@app.post("/webscan/frame")
async def post_frame(payload: WebScanFrame, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    p: WebScanInput | None = app.state.publisher
    if p is None:
        raise HTTPException(status_code=503, detail="publisher unavailable")
    return p.publish_webscan_frame(payload, authorization)


@app.post("/webscan/sessions")
async def create_session(payload: WebScanSessionCreate, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    p: WebScanInput | None = app.state.publisher
    if p is None:
        raise HTTPException(status_code=503, detail="publisher unavailable")
    return p.create_session(payload, authorization)


@app.get("/webscan/sessions")
async def list_sessions() -> dict[str, Any]:
    p: WebScanInput | None = app.state.publisher
    if p is None:
        raise HTTPException(status_code=503, detail="publisher unavailable")
    return p.list_sessions()


@app.get("/webscan/sessions/{session_id}")
async def get_session(session_id: str) -> dict[str, Any]:
    p: WebScanInput | None = app.state.publisher
    if p is None:
        raise HTTPException(status_code=503, detail="publisher unavailable")
    return p.get_session(session_id)


@app.post("/webscan/sessions/{session_id}/frame")
async def post_session_frame(session_id: str, payload: WebScanFrame, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    p: WebScanInput | None = app.state.publisher
    if p is None:
        raise HTTPException(status_code=503, detail="publisher unavailable")
    return p.publish_webscan_frame(payload, authorization, session_id=session_id)


@app.post("/webscan/sessions/{session_id}/event")
async def post_session_event(session_id: str, payload: WebScanSessionEvent, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    p: WebScanInput | None = app.state.publisher
    if p is None:
        raise HTTPException(status_code=503, detail="publisher unavailable")
    return p.record_event(session_id, payload, authorization)


@app.post("/webscan/sessions/{session_id}/finish")
async def finish_session(session_id: str, authorization: str | None = Header(default=None)) -> dict[str, Any]:
    p: WebScanInput | None = app.state.publisher
    if p is None:
        raise HTTPException(status_code=503, detail="publisher unavailable")
    return p.finish_session(session_id, authorization)


class WebScanInput(Module):
    color_image: Out[Image]
    camera_info: Out[CameraInfo]
    odom: Out[PoseStamped]

    def __init__(self, host: str = "127.0.0.1", port: int = 9991, start_server: bool = True) -> None:
        super().__init__()
        self._host = host
        self._port = port
        self._token = ""
        self._start_server = start_server
        self._rate_window: deque[float] = deque(maxlen=RATE_LIMIT_PER_SEC * 2)
        self._sessions: dict[str, SessionState] = {}
        self._latest_session: str | None = None
        self._lock = threading.Lock()
        self._uvicorn_server: uvicorn.Server | None = None
        self._serve_future = None

    @rpc
    def start(self) -> None:
        super().start()
        self._token = os.getenv("DIMOS_WEB_SCAN_TOKEN", "")
        app.state.publisher = self
        if self._start_server:
            config = uvicorn.Config(app, host=self._host, port=self._port, log_level="warning")
            self._uvicorn_server = uvicorn.Server(config)
            if self._loop is not None:
                self._serve_future = self._loop.run_in_executor(None, self._uvicorn_server.run)
            else:
                t = threading.Thread(target=self._uvicorn_server.run, daemon=True)
                t.start()
                self._serve_future = t

    @rpc
    def stop(self) -> None:
        if self._uvicorn_server is not None:
            self._uvicorn_server.should_exit = True
        if hasattr(self._serve_future, "result"):
            try:
                self._serve_future.result(timeout=2.0)
            except Exception:
                pass
        app.state.publisher = None
        self._uvicorn_server = None
        self._serve_future = None
        super().stop()

    def _auth(self, authorization: str | None) -> None:
        if not self._token:
            return
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="missing bearer token")
        if authorization.removeprefix("Bearer ").strip() != self._token:
            raise HTTPException(status_code=401, detail="invalid bearer token")

    def _limit(self) -> None:
        now = time.time()
        while self._rate_window and now - self._rate_window[0] > 1.0:
            self._rate_window.popleft()
        if len(self._rate_window) >= RATE_LIMIT_PER_SEC:
            raise HTTPException(status_code=429, detail="frame rate limit exceeded")
        self._rate_window.append(now)

    def _session_dict(self, st: SessionState) -> dict[str, Any]:
        return {
            "session_id": st.session_id,
            "place_name": st.place_name,
            "description": st.description,
            "started_at": st.started_at,
            "finished_at": st.finished_at,
            "frames_received": st.frames_received,
            "last_frame_at": st.last_frame_at,
            "rooms": st.rooms,
            "events": st.events,
            "status": st.status,
        }

    def _ensure_session(self, session_id: str, ts: float) -> SessionState:
        st = self._sessions.get(session_id)
        if st is None:
            st = SessionState(session_id=session_id, place_name=None, description=None, started_at=ts)
            self._sessions[session_id] = st
        return st

    def create_session(self, payload: WebScanSessionCreate, authorization: str | None) -> dict[str, Any]:
        self._auth(authorization)
        now = time.time()
        sid = payload.session_id or f"session-{int(now * 1000)}"
        with self._lock:
            if sid in self._sessions:
                raise HTTPException(status_code=409, detail="session already exists")
            st = SessionState(session_id=sid, place_name=payload.place_name, description=payload.description, started_at=now)
            self._sessions[sid] = st
            self._latest_session = sid
        return {"ok": True, "session": self._session_dict(st)}

    def list_sessions(self) -> dict[str, Any]:
        with self._lock:
            sessions = [self._session_dict(st) for st in self._sessions.values()]
        return {"ok": True, "sessions": sessions}

    def get_session(self, session_id: str) -> dict[str, Any]:
        with self._lock:
            st = self._sessions.get(session_id)
            if st is None:
                raise HTTPException(status_code=404, detail="session not found")
            return {"ok": True, "session": self._session_dict(st)}

    def record_event(self, session_id: str, payload: WebScanSessionEvent, authorization: str | None) -> dict[str, Any]:
        self._auth(authorization)
        ts = payload.ts or time.time()
        with self._lock:
            st = self._ensure_session(session_id, ts)
            st.events.append({"event_type": payload.event_type, "room_id": payload.room_id, "note": payload.note, "ts": ts})
            if payload.room_id and all(r.get("room_id") != payload.room_id for r in st.rooms):
                st.rooms.append({"room_id": payload.room_id, "first_seen_at": ts})
        return {"ok": True, "session": self._session_dict(st)}

    def finish_session(self, session_id: str, authorization: str | None) -> dict[str, Any]:
        self._auth(authorization)
        now = time.time()
        with self._lock:
            st = self._sessions.get(session_id)
            if st is None:
                raise HTTPException(status_code=404, detail="session not found")
            st.finished_at = now
            st.status = "finished"
        return {"ok": True, "session": self._session_dict(st)}

    def publish_webscan_frame(self, payload: WebScanFrame, authorization: str | None, session_id: str | None = None) -> dict[str, Any]:
        self._auth(authorization)
        self._limit()
        if len(payload.image_b64) > MAX_PAYLOAD_BYTES:
            raise HTTPException(status_code=413, detail="payload too large")
        try:
            data = base64.b64decode(payload.image_b64, validate=True)
        except binascii.Error as exc:
            raise HTTPException(status_code=400, detail="invalid base64 payload") from exc
        try:
            rgb = np.array(PILImage.open(io.BytesIO(data)).convert("RGB"))
        except Exception as exc:
            raise HTTPException(status_code=400, detail="image decode failed") from exc
        ts = payload.ts or time.time()
        self.color_image.publish(Image.from_numpy(rgb, format=ImageFormat.RGB, frame_id=payload.frame_id, ts=ts))
        h, w = int(rgb.shape[0]), int(rgb.shape[1])
        fx = w * 0.8
        fy = h * 0.8
        cx = w / 2.0
        cy = h / 2.0
        self.camera_info.publish(CameraInfo(height=h, width=w, frame_id=payload.frame_id, K=[fx, 0.0, cx, 0.0, fy, cy, 0.0, 0.0, 1.0], P=[fx, 0.0, cx, 0.0, 0.0, fy, cy, 0.0, 0.0, 0.0, 1.0, 0.0], ts=ts))
        self.odom.publish(PoseStamped(ts=ts, frame_id="map", position=[0.0, 0.0, 0.0]))
        if self.tf is not None:
            self.tf.publish(
                Transform(frame_id="map", child_frame_id="base_link", ts=ts),
                Transform(frame_id="base_link", child_frame_id=payload.frame_id, ts=ts, translation=Vector3(0.15, 0.0, 0.2)),
            )
        sid = session_id or payload.room_id or "default"
        with self._lock:
            st = self._ensure_session(sid, ts)
            if payload.room_id and all(r.get("room_id") != payload.room_id for r in st.rooms):
                st.rooms.append({"room_id": payload.room_id, "first_seen_at": ts})
            st.frames_received += 1
            st.last_frame_at = ts
            self._latest_session = sid
        return {"ok": True, "session_id": sid}

    def status_dict(self) -> dict[str, Any]:
        return {"ok": True, "sessions": len(self._sessions), "latest_session": self._latest_session}

    @skill
    def web_scan_status(self) -> str:
        """Get web scan service status with session count and latest session id."""
        return str(self.status_dict())

    @skill
    def latest_web_scan_session(self) -> str:
        """Get latest web scan session id with frame counters."""
        if not self._latest_session:
            return "No web scan sessions yet"
        st = self._sessions[self._latest_session]
        return f"session={self._latest_session}, frames={st.frames_received}"

    @skill
    def clear_web_scan_sessions(self) -> str:
        """Clear tracked web scan sessions from memory."""
        n = len(self._sessions)
        self._sessions.clear()
        self._latest_session = None
        return f"Cleared {n} sessions"


web_scan_input = WebScanInput.blueprint
