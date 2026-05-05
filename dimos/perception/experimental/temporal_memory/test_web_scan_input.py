import base64
import io
import json
import os

from fastapi import HTTPException
from fastapi.testclient import TestClient
import numpy as np
from PIL import Image as PILImage

from dimos.perception.experimental.temporal_memory.web_scan_input import MAX_PAYLOAD_BYTES, RATE_LIMIT_PER_SEC, WebScanFrame, WebScanInput, app


def _b64() -> str:
    arr = np.zeros((16, 16, 3), dtype=np.uint8)
    arr[:, :, 0] = 50
    img = PILImage.fromarray(arr)
    b = io.BytesIO()
    img.save(b, format="JPEG")
    return base64.b64encode(b.getvalue()).decode()


def _publisher() -> WebScanInput:
    p = WebScanInput(start_server=False)
    p.start()
    return p


def test_invalid_base64_400() -> None:
    app.state.publisher = WebScanInput(start_server=False)
    r = TestClient(app).post("/webscan/frame", json={"image_b64": "%%%"})
    assert r.status_code == 400


def test_payload_too_large_413() -> None:
    p = WebScanInput(start_server=False)
    try:
        p.publish_webscan_frame(WebScanFrame(image_b64="a" * (MAX_PAYLOAD_BYTES + 1)), None)
    except HTTPException as e:
        assert e.status_code == 413


def test_rate_limit_429() -> None:
    p = WebScanInput(start_server=False)
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


def test_session_lifecycle_and_backward_compat() -> None:
    p = _publisher()
    client = TestClient(app)
    created = client.post("/webscan/sessions", json={"place_name": "Lab", "description": "Desc"})
    assert created.status_code == 200
    sid = created.json()["session"]["session_id"]
    assert isinstance(sid, str) and sid
    listed = client.get("/webscan/sessions")
    assert listed.status_code == 200
    assert any(s["session_id"] == sid for s in listed.json()["sessions"])
    got = client.get(f"/webscan/sessions/{sid}")
    assert got.status_code == 200

    ev = client.post(f"/webscan/sessions/{sid}/event", json={"event_type": "room_started", "room_id": "room-1"})
    assert ev.status_code == 200
    fr = client.post(f"/webscan/sessions/{sid}/frame", json={"image_b64": _b64(), "frame_id": "ios_camera", "room_id": "room-1", "guidance_hint": "look-corners"})
    assert fr.status_code == 200
    fin = client.post(f"/webscan/sessions/{sid}/finish")
    assert fin.status_code == 200
    assert fin.json()["session"]["status"] == "finished"

    legacy = client.post("/webscan/frame", json={"image_b64": _b64(), "room_id": "legacy-room"})
    assert legacy.status_code == 200
    legacy_sid = legacy.json()["session_id"]
    legacy_get = client.get(f"/webscan/sessions/{legacy_sid}")
    assert legacy_get.status_code == 200
    p.stop()


def test_token_auth_on_session_endpoints_and_skills_json() -> None:
    os.environ["DIMOS_WEB_SCAN_TOKEN"] = "secret"
    p = _publisher()
    client = TestClient(app)
    assert client.post("/webscan/sessions", json={"place_name": "x"}).status_code == 401
    ok = client.post("/webscan/sessions", json={"place_name": "x"}, headers={"Authorization": "Bearer secret"})
    assert ok.status_code == 200
    sid = ok.json()["session"]["session_id"]
    assert client.post(f"/webscan/sessions/{sid}/event", json={"event_type": "note"}).status_code == 401
    assert client.post(f"/webscan/sessions/{sid}/event", json={"event_type": "note"}, headers={"Authorization": "Bearer secret"}).status_code == 200

    for raw in [p.web_scan_status(), p.latest_web_scan_session(), p.clear_web_scan_sessions(), p.get_web_scan_session("missing")]:
        parsed = json.loads(raw)
        assert isinstance(parsed, dict)

    p.stop()
    del os.environ["DIMOS_WEB_SCAN_TOKEN"]


def test_start_stop_server_state() -> None:
    p = WebScanInput(host="127.0.0.1", port=0, start_server=True)
    p.start()
    assert p._uvicorn_server is not None
    assert p._serve_future is not None
    assert app.state.publisher is p
    p.stop()
    assert p._uvicorn_server is None
    assert p._serve_future is None
    assert app.state.publisher is None
