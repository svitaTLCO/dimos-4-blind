import base64
import time
import sys
import types

import numpy as np

if "cv2" not in sys.modules:
    cv2_stub = types.ModuleType("cv2")
    cv2_stub.IMREAD_COLOR = 1  # type: ignore[attr-defined]
    cv2_stub.COLOR_BGR2RGB = 1  # type: ignore[attr-defined]
    sys.modules["cv2"] = cv2_stub

from dimos.assistive.iphone_sensor_gateway import IPhoneSensorGateway
from dimos.msgs.sensor_msgs import Imu


class _Collector:
    def __init__(self) -> None:
        self.values = []

    def publish(self, value) -> None:  # type: ignore[no-untyped-def]
        self.values.append(value)


def _encode_test_image() -> str:
    img = np.zeros((6, 8, 3), dtype=np.uint8)
    return base64.b64encode(img.tobytes()).decode("utf-8")


def test_gateway_ingests_imu_and_text() -> None:
    gateway = IPhoneSensorGateway()
    gateway.color_image = _Collector()  # type: ignore[assignment]
    gateway.imu = _Collector()  # type: ignore[assignment]
    gateway.human_input = _Collector()  # type: ignore[assignment]
    gateway.gateway_event = _Collector()  # type: ignore[assignment]

    payload = {
        "ts": time.time(),
        "text": "guide me to elevator",
        "imu": {
            "accel": {"x": 0.1, "y": 0.2, "z": 9.8},
            "gyro": {"x": 0.01, "y": 0.02, "z": 0.03},
            "orientation": {"x": 0.0, "y": 0.0, "z": 0.0, "w": 1.0},
        },
    }

    published = gateway._handle_payload(payload)

    assert set(published) == {"human_input", "imu"}
    assert len(gateway.human_input.values) == 1
    assert gateway.human_input.values[0] == "guide me to elevator"

    assert len(gateway.imu.values) == 1
    assert isinstance(gateway.imu.values[0], Imu)

def test_gateway_drops_stale_imu_payloads() -> None:
    gateway = IPhoneSensorGateway()

    stale = time.time() - 20.0

    assert gateway._decode_imu({"ts": stale, "imu": {"accel": {}, "gyro": {}}}, time.time()) is None


def test_gateway_drops_payload_without_supported_fields() -> None:
    gateway = IPhoneSensorGateway()
    gateway.color_image = _Collector()  # type: ignore[assignment]
    gateway.imu = _Collector()  # type: ignore[assignment]
    gateway.human_input = _Collector()  # type: ignore[assignment]
    gateway.gateway_event = _Collector()  # type: ignore[assignment]

    published = gateway._handle_payload({"ts": time.time(), "foo": "bar"})

    assert published == []
    assert gateway.gateway_event.values
    assert "payload_dropped:no_supported_fields" in gateway.gateway_event.values[-1]
