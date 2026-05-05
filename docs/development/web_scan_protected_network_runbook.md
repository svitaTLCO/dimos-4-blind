# Web Scan Protected-Network Runbook

This runbook validates the local protected-network workflow:

1. Web app creates scan session.
2. Web app sends frame(s) by session id.
3. DimOS ingests and processes frames (TemporalMemory pipeline).
4. MCP query returns scan results.
5. Web app displays the result.

## Prerequisites

- Start blueprint:

```bash
dimos --replay run web-scan-temporal-memory-mcp --daemon
```

- Optional auth:

```bash
export DIMOS_WEB_SCAN_TOKEN=<shared-secret>
```

- Optional Next.js proxy env:

```bash
export DIMOS_WEB_SCAN_URL=http://127.0.0.1:9991/webscan/frame
export DIMOS_WEB_SCAN_SESSION_BASE_URL=http://127.0.0.1:9991/webscan/sessions
```

## Backend-only smoke test

```bash
scripts/demo_web_scan_smoke.sh
```

Expected: JSON output for a finished session with `frames_received >= 1`.

## App-assisted test

1. Launch web app and open live scan.
2. Confirm frame uploads are successful (no repeated upload errors).
3. Complete at least one room and finish scan.
4. Validate backend state:

```bash
curl -s http://127.0.0.1:9991/webscan/sessions | python -m json.tool
```

5. Query MCP for semantic result:

```bash
dimos mcp call temporal_memory_query --arg question="What objects are visible in the latest web scan session?"
```

## Backward compatibility check

Old endpoint still works with room-based compatibility mapping:

```bash
curl -s -X POST http://127.0.0.1:9991/webscan/frame \
  -H 'Content-Type: application/json' \
  -d '{"image_b64":"<base64-jpeg>","room_id":"legacy-room"}'
```

This is mapped into a default-compatible session keyed by `room_id`.
