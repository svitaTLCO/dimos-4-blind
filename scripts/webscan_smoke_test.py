#!/usr/bin/env python3
from __future__ import annotations
import base64, io, json, os, time
from urllib import request
from PIL import Image
import numpy as np

BASE = os.getenv("DIMOS_WEB_SCAN_URL", "http://127.0.0.1:9991").rstrip("/")
TOKEN = os.getenv("DIMOS_WEB_SCAN_TOKEN")
MCP = os.getenv("DIMOS_MCP_URL")


def call(method: str, path: str, body: dict | None = None) -> tuple[int, dict]:
    data = json.dumps(body).encode() if body is not None else None
    req = request.Request(f"{BASE}{path}", data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if TOKEN:
        req.add_header("Authorization", f"Bearer {TOKEN}")
    with request.urlopen(req, timeout=15) as r:
        return r.status, json.loads(r.read().decode() or "{}")


def jpeg_b64(i: int) -> str:
    arr = np.zeros((48, 64, 3), dtype=np.uint8)
    arr[:, :, 0] = (i * 20) % 255
    arr[:, :, 1] = 40 + i
    arr[8:20, 8+i:20+i, :] = 255
    im = Image.fromarray(arr)
    bio = io.BytesIO(); im.save(bio, format="JPEG", quality=60)
    return base64.b64encode(bio.getvalue()).decode()

_, created = call("POST", "/webscan/sessions", {"place_name": "smoke", "description": "local harness"})
sid = created["session"]["session_id"]
print("session_id", sid)
for i in range(10):
    call("POST", f"/webscan/sessions/{sid}/frame", {"image_b64": jpeg_b64(i), "frame_id": "smoke_cam", "room_id": "room-1", "guidance_hint": "look-corners", "ts": time.time()})
call("POST", f"/webscan/sessions/{sid}/finish", {})
_, sess = call("GET", f"/webscan/sessions/{sid}")
print(json.dumps(sess, indent=2))
if MCP:
    payload = {"jsonrpc": "2.0", "id": 1, "method": "tools/list", "params": {}}
    req = request.Request(MCP, data=json.dumps(payload).encode(), method="POST")
    req.add_header("Content-Type", "application/json")
    with request.urlopen(req, timeout=15) as r:
        print("mcp tools/list", r.status)
