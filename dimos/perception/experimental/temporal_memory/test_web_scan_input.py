import base64
import io

from fastapi.testclient import TestClient
import numpy as np
from PIL import Image as PILImage

from dimos.perception.experimental.temporal_memory.web_scan_input import WebScanInput, app


def _b64() -> str:
    arr = np.zeros((16, 16, 3), dtype=np.uint8)
    arr[:, :, 1] = 255
    img = PILImage.fromarray(arr)
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")


def test_health_and_status() -> None:
    app.state.publisher = WebScanInput()
    client = TestClient(app)
    assert client.get("/webscan/health").status_code == 200
    assert client.get("/webscan/status").status_code == 200


def test_upload_rejects_invalid_base64() -> None:
    app.state.publisher = WebScanInput()
    client = TestClient(app)
    r = client.post("/webscan/frame", json={"image_b64": "%%%"})
    assert r.status_code == 400


def test_upload_accepts_valid_frame() -> None:
    app.state.publisher = WebScanInput()
    client = TestClient(app)
    r = client.post("/webscan/frame", json={"image_b64": _b64(), "room_id": "room-a"})
    assert r.status_code == 200
    assert r.json()["ok"] is True
