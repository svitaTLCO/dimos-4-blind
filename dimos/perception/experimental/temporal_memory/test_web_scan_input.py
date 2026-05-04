import base64
import io
import os

from fastapi import HTTPException
from fastapi.testclient import TestClient
import numpy as np
from PIL import Image as PILImage

from dimos.perception.experimental.temporal_memory.web_scan_input import RATE_LIMIT_PER_SEC, MAX_PAYLOAD_BYTES, WebScanFrame, WebScanInput, app
from dimos.robot.web_scan.blueprints.web_scan_temporal_memory_mcp import web_scan_temporal_memory_mcp


def _b64() -> str:
    arr = np.zeros((16, 16, 3), dtype=np.uint8)
    img = PILImage.fromarray(arr)
    b = io.BytesIO()
    img.save(b, format="JPEG")
    return base64.b64encode(b.getvalue()).decode()


def test_blueprint_import() -> None:
    assert web_scan_temporal_memory_mcp is not None


def test_invalid_base64_400() -> None:
    app.state.publisher = WebScanInput()
    r = TestClient(app).post("/webscan/frame", json={"image_b64": "%%%"})
    assert r.status_code == 400


def test_payload_too_large_413() -> None:
    p = WebScanInput()
    try:
        p.publish_webscan_frame(WebScanFrame(image_b64="a" * (MAX_PAYLOAD_BYTES + 1)), None)
    except HTTPException as e:
        assert e.status_code == 413


def test_rate_limit_429() -> None:
    p = WebScanInput()
    payload = WebScanFrame(image_b64=_b64())
    hit = False
    for _ in range(RATE_LIMIT_PER_SEC + 2):
        try:
            p.publish_webscan_frame(payload, None)
        except HTTPException as e:
            if e.status_code == 429:
                hit = True
                break
    assert hit


def test_token_auth() -> None:
    os.environ["DIMOS_WEB_SCAN_TOKEN"] = "secret"
    p = WebScanInput(); p.start()
    payload = WebScanFrame(image_b64=_b64())
    for auth, code in [(None, 401), ("Bearer wrong", 401), ("Bearer secret", 200)]:
        try:
            p.publish_webscan_frame(payload, auth)
            got = 200
        except HTTPException as e:
            got = e.status_code
        assert got == code
    del os.environ["DIMOS_WEB_SCAN_TOKEN"]


def test_no_token_allows_upload() -> None:
    if "DIMOS_WEB_SCAN_TOKEN" in os.environ:
        del os.environ["DIMOS_WEB_SCAN_TOKEN"]
    p = WebScanInput(); p.start()
    assert p.publish_webscan_frame(WebScanFrame(image_b64=_b64()), None)["ok"] is True


def test_skills_and_tf_publish() -> None:
    p = WebScanInput(); p.start()
    p.publish_webscan_frame(WebScanFrame(image_b64=_b64(), room_id="r1"), None)
    assert "sessions" in p.web_scan_status()
    assert "session=" in p.latest_web_scan_session()
    assert "Cleared" in p.clear_web_scan_sessions()
