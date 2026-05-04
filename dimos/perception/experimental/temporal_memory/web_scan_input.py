from __future__ import annotations

import base64
import io
import time
from typing import Any

from fastapi import FastAPI
import numpy as np
from pydantic import BaseModel
from PIL import Image as PILImage
import uvicorn

from dimos.core.core import rpc
from dimos.core.module import Module
from dimos.core.stream import Out
from dimos.msgs.geometry_msgs.PoseStamped import PoseStamped
from dimos.msgs.sensor_msgs import CameraInfo, Image
from dimos.msgs.sensor_msgs.Image import ImageFormat
from dimos.utils.logging_config import setup_logger

logger = setup_logger()

app = FastAPI()
app.state.publisher = None


class WebScanFrame(BaseModel):
    image_b64: str
    format: str = "RGB"
    frame_id: str = "ios_camera"
    ts: float | None = None
    room_id: str | None = None
    guidance_hint: str | None = None
    camera_width: int | None = None
    camera_height: int | None = None


@app.post("/webscan/frame")
async def post_frame(payload: WebScanFrame) -> dict[str, Any]:
    publisher: WebScanInput | None = app.state.publisher
    if publisher is None:
        return {"ok": False, "error": "WebScanInput publisher unavailable"}
    return publisher.publish_webscan_frame(payload)


class WebScanInput(Module):
    color_image: Out[Image]
    camera_info: Out[CameraInfo]
    odom: Out[PoseStamped]

    def __init__(self, host: str = "0.0.0.0", port: int = 9991) -> None:
        super().__init__()
        self._host = host
        self._port = port
        self._uvicorn_server: uvicorn.Server | None = None
        self._serve_future = None

    @rpc
    def start(self) -> None:
        super().start()
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

    def publish_webscan_frame(self, payload: WebScanFrame) -> dict[str, Any]:
        ts = payload.ts or time.time()
        data = base64.b64decode(payload.image_b64)
        rgb_image = np.array(PILImage.open(io.BytesIO(data)).convert("RGB"))

        msg = Image.from_numpy(rgb_image, format=ImageFormat.RGB, frame_id=payload.frame_id, ts=ts)
        self.color_image.publish(msg)

        width = payload.camera_width or int(rgb_image.shape[1])
        height = payload.camera_height or int(rgb_image.shape[0])
        fx = width * 0.8
        fy = height * 0.8
        cx = width / 2.0
        cy = height / 2.0
        cam = CameraInfo(
            height=height,
            width=width,
            frame_id=payload.frame_id,
            K=[fx, 0.0, cx, 0.0, fy, cy, 0.0, 0.0, 1.0],
            P=[fx, 0.0, cx, 0.0, 0.0, fy, cy, 0.0, 0.0, 0.0, 1.0, 0.0],
            ts=ts,
        )
        self.camera_info.publish(cam)

        self.odom.publish(PoseStamped(ts=ts, frame_id="map", position=[0.0, 0.0, 0.0]))
        logger.info("webscan frame published", frame_id=payload.frame_id, room=payload.room_id)
        return {"ok": True, "ts": ts, "width": width, "height": height}


web_scan_input = WebScanInput.blueprint
