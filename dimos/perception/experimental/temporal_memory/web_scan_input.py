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


@dataclass
class SessionState:
    started_at: float
    frames_received: int = 0
    last_frame_at: float = 0.0


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


class WebScanInput(Module):
    color_image: Out[Image]
    camera_info: Out[CameraInfo]
    odom: Out[PoseStamped]

    def __init__(self, host: str = "127.0.0.1", port: int = 9991) -> None:
        super().__init__()
        self._host = host
        self._port = port
        self._token = ""
        self._rate_window: deque[float] = deque(maxlen=RATE_LIMIT_PER_SEC * 2)
        self._sessions: dict[str, SessionState] = {}
        self._latest_session: str | None = None
        self._lock = threading.Lock()

    @rpc
    def start(self) -> None:
        super().start()
        self._token = os.getenv("DIMOS_WEB_SCAN_TOKEN", "")
        app.state.publisher = self

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

    def publish_webscan_frame(self, payload: WebScanFrame, authorization: str | None) -> dict[str, Any]:
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
        self.camera_info.publish(CameraInfo(height=h, width=w, frame_id=payload.frame_id, ts=ts))
        self.odom.publish(PoseStamped(ts=ts, frame_id="map", position=[0.0, 0.0, 0.0]))
        if self.tf is not None:
            self.tf.publish(
                Transform(frame_id="map", child_frame_id="base_link", ts=ts),
                Transform(frame_id="base_link", child_frame_id=payload.frame_id, ts=ts, translation=Vector3(0.15, 0.0, 0.2)),
            )
        sid = payload.room_id or "default"
        with self._lock:
            st = self._sessions.setdefault(sid, SessionState(started_at=ts))
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
