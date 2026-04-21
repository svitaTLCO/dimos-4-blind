# Copyright 2026 Dimensional Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from __future__ import annotations

import base64
from dataclasses import dataclass
import json
from pathlib import Path
from threading import Thread
import time
from typing import Any

import cv2
import numpy as np
from fastapi import WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles

from dimos.core.core import rpc
from dimos.core.module import Module, ModuleConfig
from dimos.core.stream import Out
from dimos.msgs.geometry_msgs import Quaternion, Vector3
from dimos.msgs.sensor_msgs import Image, Imu
from dimos.msgs.sensor_msgs.Image import ImageFormat
from dimos.utils.logging_config import setup_logger
from dimos.web.robot_web_interface import RobotWebInterface

logger = setup_logger()

STATIC_DIR = Path(__file__).parent / "web" / "static"


@dataclass
class IPhoneSensorGatewayConfig(ModuleConfig):
    server_port: int = 8899
    max_sensor_age_s: float = 2.0
    max_future_skew_s: float = 2.0
    image_frame_id: str = "iphone_camera"
    imu_frame_id: str = "iphone_imu"


class IPhoneSensorGateway(Module[IPhoneSensorGatewayConfig]):
    """Gateway module for iPhone sensor ingestion."""

    default_config = IPhoneSensorGatewayConfig

    color_image: Out[Image]
    imu: Out[Imu]
    human_input: Out[str]
    gateway_event: Out[str]

    _web_server: RobotWebInterface | None = None
    _web_server_thread: Thread | None = None

    @rpc
    def start(self) -> None:
        super().start()
        self._start_server()

    @rpc
    def stop(self) -> None:
        self._stop_server()
        super().stop()

    @rpc
    def ingest_payload(self, payload: dict[str, Any]) -> str:
        """Ingest one payload and publish resulting streams."""
        published = self._handle_payload(payload)
        return f"Published: {', '.join(published)}" if published else "Dropped payload"

    def _start_server(self) -> None:
        if self._web_server_thread is not None and self._web_server_thread.is_alive():
            logger.warning("iPhone sensor gateway web server already running")
            return

        self._web_server = RobotWebInterface(port=self.config.server_port)
        self._setup_routes(self._web_server)

        self._web_server_thread = Thread(
            target=self._web_server.run,
            daemon=True,
            name="IPhoneSensorGatewayServer",
        )
        self._web_server_thread.start()
        logger.info(f"iPhone sensor gateway started on http://0.0.0.0:{self.config.server_port}")

    def _stop_server(self) -> None:
        if self._web_server is not None:
            self._web_server.shutdown()
        if self._web_server_thread is not None:
            self._web_server_thread.join(timeout=2.0)
            self._web_server_thread = None
        self._web_server = None

    def _setup_routes(self, server: RobotWebInterface) -> None:
        @server.app.get("/assistive", response_class=HTMLResponse)
        async def assistive_index() -> HTMLResponse:
            index_path = STATIC_DIR / "index.html"
            if not index_path.exists():
                return HTMLResponse(content="iPhone Sensor Gateway", status_code=200)
            return HTMLResponse(content=index_path.read_text())

        if STATIC_DIR.is_dir():
            server.app.mount("/assistive/static", StaticFiles(directory=str(STATIC_DIR)))

        @server.app.websocket("/assistive/ws")
        async def websocket_endpoint(ws: WebSocket) -> None:
            await ws.accept()
            logger.info("iPhone sensor gateway client connected")

            try:
                while True:
                    raw = await ws.receive_text()
                    payload = json.loads(raw)
                    published = self._handle_payload(payload)
                    await ws.send_json({"ok": True, "published": published})
            except WebSocketDisconnect:
                logger.info("iPhone sensor gateway client disconnected")
            except Exception:
                logger.exception("iPhone sensor gateway websocket error")

    def _handle_payload(self, payload: dict[str, Any]) -> list[str]:
        ok, reason = self._validate_payload(payload)
        if not ok:
            self._publish_event(f"payload_dropped:{reason}")
            return []

        now = time.time()
        published: list[str] = []

        text = payload.get("text")
        if isinstance(text, str) and text.strip():
            self.human_input.publish(text.strip())
            published.append("human_input")

        transcript = payload.get("voice_transcript")
        if isinstance(transcript, str) and transcript.strip():
            self.human_input.publish(transcript.strip())
            if "human_input" not in published:
                published.append("human_input")

        imu_msg = self._decode_imu(payload, now)
        if imu_msg is not None:
            self.imu.publish(imu_msg)
            published.append("imu")

        image_msg = self._decode_image(payload, now)
        if image_msg is not None:
            self.color_image.publish(image_msg)
            published.append("color_image")

        return published

    def _validate_payload(self, payload: Any) -> tuple[bool, str]:
        if not isinstance(payload, dict):
            return False, "not_dict"

        ts = payload.get("ts")
        if ts is not None and not isinstance(ts, (float, int)):
            return False, "invalid_ts"

        has_text = isinstance(payload.get("text"), str) and bool(payload.get("text", "").strip())
        has_transcript = isinstance(payload.get("voice_transcript"), str) and bool(
            payload.get("voice_transcript", "").strip()
        )
        has_imu = isinstance(payload.get("imu"), dict)
        has_image = isinstance(payload.get("image_b64"), str) and bool(payload.get("image_b64"))

        if not (has_text or has_transcript or has_imu or has_image):
            return False, "no_supported_fields"

        return True, "ok"

    def _publish_event(self, event: str) -> None:
        stream = getattr(self, "gateway_event", None)
        if stream is None:
            return
        try:
            stream.publish(event)
        except Exception:
            logger.exception("Failed to publish gateway event")

    def _normalize_ts(self, ts: float | int | None, now: float) -> float | None:
        if ts is None:
            return now

        ts_float = float(ts)

        if ts_float > now + self.config.max_future_skew_s:
            return now

        if now - ts_float > self.config.max_sensor_age_s:
            return None

        return ts_float

    def _decode_imu(self, payload: dict[str, Any], now: float) -> Imu | None:
        raw = payload.get("imu")
        if not isinstance(raw, dict):
            return None

        ts = self._normalize_ts(raw.get("ts") or payload.get("ts"), now)
        if ts is None:
            return None

        accel = raw.get("accel", {})
        gyro = raw.get("gyro", {})
        orientation = raw.get("orientation", {})

        return Imu(
            angular_velocity=Vector3(
                float(gyro.get("x", 0.0)),
                float(gyro.get("y", 0.0)),
                float(gyro.get("z", 0.0)),
            ),
            linear_acceleration=Vector3(
                float(accel.get("x", 0.0)),
                float(accel.get("y", 0.0)),
                float(accel.get("z", 0.0)),
            ),
            orientation=Quaternion(
                float(orientation.get("x", 0.0)),
                float(orientation.get("y", 0.0)),
                float(orientation.get("z", 0.0)),
                float(orientation.get("w", 1.0)),
            ),
            frame_id=self.config.imu_frame_id,
            ts=ts,
        )

    def _decode_image(self, payload: dict[str, Any], now: float) -> Image | None:
        encoded = payload.get("image_b64")
        if not isinstance(encoded, str) or not encoded:
            return None

        ts = self._normalize_ts(payload.get("image_ts") or payload.get("ts"), now)
        if ts is None:
            return None

        try:
            binary = base64.b64decode(encoded)
            array = np.frombuffer(binary, dtype=np.uint8)
            image_bgr = cv2.imdecode(array, cv2.IMREAD_COLOR)
            if image_bgr is None:
                return None
        except Exception:
            logger.exception("Failed to decode incoming iPhone frame")
            return None

        image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
        return Image.from_numpy(
            image_rgb,
            format=ImageFormat.RGB,
            frame_id=self.config.image_frame_id,
            ts=ts,
        )


iphone_sensor_gateway = IPhoneSensorGateway.blueprint

__all__ = [
    "IPhoneSensorGateway",
    "IPhoneSensorGatewayConfig",
    "iphone_sensor_gateway",
]
