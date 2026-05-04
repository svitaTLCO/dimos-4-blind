from __future__ import annotations

import base64
import binascii
import io
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
from dimos.msgs.sensor_msgs import CameraInfo, Image
from dimos.msgs.sensor_msgs.Image import ImageFormat
from dimos.utils.logging_config import setup_logger

logger = setup_logger()

MAX_PAYLOAD_BYTES = 2_500_000
RATE_LIMIT_PER_SEC = 5

app = FastAPI()
app.state.publisher = None


class WebScanFrame(BaseModel):
    image_b64: str
    frame_id: str = "ios_camera"
    ts: float | None = None
    room_id: str | None = None
    guidance_hint: str | None = None


@dataclass
class SessionState:
    started_at: float
    frames_received: int = 0
    last_frame_at: float = 0.0


@app.get("/webscan/health")
async def health() -> dict[str, Any]:
    return {"ok": True, "service": "web_scan_input"}


@app.get("/webscan/status")
async def status() -> dict[str, Any]:
    publisher: WebScanInput | None = app.state.publisher
    if publisher is None:
        return {"ok": False, "error": "publisher unavailable"}
    return publisher.status_dict()


@app.post("/webscan/frame")
async def post_frame(
    payload: WebScanFrame,
    authorization: str | None = Header(default=None),
) -> dict[str, Any]:
    publisher: WebScanInput | None = app.state.publisher
    if publisher is None:
        raise HTTPException(status_code=503, detail="publisher unavailable")
    return publisher.publish_webscan_frame(payload, authorization)


class WebScanInput(Module):
    color_image: Out[Image]
    camera_info: Out[CameraInfo]
    odom: Out[PoseStamped]

    def __init__(self, host: str = "127.0.0.1", port: int = 9991) -> None:
        super().__init__()
        self._host = host
        self._port = port
        self._uvicorn_server: uvicorn.Server | None = None
        self._serve_future = None
        self._token = ""
        self._rate_window: deque[float] = deque(maxlen=RATE_LIMIT_PER_SEC * 2)
        self._sessions: dict[str, SessionState] = {}
        self._latest_session: str | None = None
        self._lock = threading.Lock()

    @rpc
    def start(self) -> None:
        super().start()
        self._token = self._config.env.get("DIMOS_WEB_SCAN_TOKEN", "") if hasattr(self, "_config") else ""
        app.state.publisher = self
        cfg = uvicorn.Config(app, host=self._host, port=self._port, log_level="warning")
        self._uvicorn_server = uvicorn.Server(cfg)
        assert self._loop is not None
        self._serve_future = self._loop.run_in_executor(None, self._uvicorn_server.run)

    @rpc
    def stop(self) -> None:
        if self._uvicorn_server:
            self._uvicorn_server.should_exit = True
        super().stop()

    def _validate_token(self, authorization: str | None) -> None:
        if not self._token:
            return
        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="missing bearer token")
        if authorization.removeprefix("Bearer ").strip() != self._token:
            raise HTTPException(status_code=401, detail="invalid bearer token")

    def _rate_limit(self) -> None:
        now = time.time()
        while self._rate_window and now - self._rate_window[0] > 1.0:
            self._rate_window.popleft()
        if len(self._rate_window) >= RATE_LIMIT_PER_SEC:
            raise HTTPException(status_code=429, detail="frame rate limit exceeded")
        self._rate_window.append(now)

    def publish_webscan_frame(self, payload: WebScanFrame, authorization: str | None) -> dict[str, Any]:
        self._validate_token(authorization)
        self._rate_limit()
        if len(payload.image_b64) > MAX_PAYLOAD_BYTES:
            raise HTTPException(status_code=413, detail="payload too large")

        ts = payload.ts or time.time()
        try:
            data = base64.b64decode(payload.image_b64, validate=True)
        except binascii.Error as exc:
            raise HTTPException(status_code=400, detail="invalid base64 payload") from exc

        try:
            rgb_image = np.array(PILImage.open(io.BytesIO(data)).convert("RGB"))
        except Exception as exc:
            raise HTTPException(status_code=400, detail="image decode failed") from exc

        self.color_image.publish(Image.from_numpy(rgb_image, format=ImageFormat.RGB, frame_id=payload.frame_id, ts=ts))
        h, w = int(rgb_image.shape[0]), int(rgb_image.shape[1])
        fx, fy, cx, cy = w * 0.8, h * 0.8, w / 2.0, h / 2.0
        self.camera_info.publish(CameraInfo(height=h, width=w, frame_id=payload.frame_id, K=[fx,0,cx,0,fy,cy,0,0,1], P=[fx,0,cx,0,0,fy,cy,0,0,0,1,0], ts=ts))
        self.odom.publish(PoseStamped(ts=ts, frame_id="map", position=[0.0, 0.0, 0.0]))
        if self.tf is not None:
            self.tf.publish(
                Transform(frame_id="map", child_frame_id="base_link", ts=ts),
                Transform(frame_id="base_link", child_frame_id=payload.frame_id, ts=ts, translation=[0.15, 0.0, 0.2]),
            )

        session_id = payload.room_id or "default"
        with self._lock:
            st = self._sessions.setdefault(session_id, SessionState(started_at=ts))
            st.frames_received += 1
            st.last_frame_at = ts
            self._latest_session = session_id
        return {"ok": True, "session_id": session_id, "ts": ts, "width": w, "height": h}

    def status_dict(self) -> dict[str, Any]:
        with self._lock:
            return {"ok": True, "sessions": len(self._sessions), "latest_session": self._latest_session}

    @skill
    def web_scan_status(self) -> str:
        """Return status for web scan ingestion service and active sessions."""
        return str(self.status_dict())

    @skill
    def latest_web_scan_session(self) -> str:
        """Return the latest observed web scan session id and counters."""
        with self._lock:
            if not self._latest_session:
                return "No web scan sessions yet"
            s = self._sessions[self._latest_session]
            return f"session={self._latest_session}, frames={s.frames_received}, last_ts={s.last_frame_at}"

    @skill
    def clear_web_scan_sessions(self) -> str:
        """Clear all in-memory web scan session counters."""
        with self._lock:
            n = len(self._sessions)
            self._sessions.clear()
            self._latest_session = None
        return f"Cleared {n} sessions"


web_scan_input = WebScanInput.blueprint
