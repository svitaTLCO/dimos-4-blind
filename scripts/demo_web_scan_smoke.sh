#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${DIMOS_WEB_SCAN_BASE_URL:-http://127.0.0.1:9991/webscan}"
TOKEN="${DIMOS_WEB_SCAN_TOKEN:-}"
HEADERS=(-H 'Content-Type: application/json')
if [[ -n "$TOKEN" ]]; then
  HEADERS+=(-H "Authorization: Bearer $TOKEN")
fi

JPEG_B64="/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDAREAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCUAAn/2Q=="

SESSION_JSON=$(curl -sS -X POST "$BASE_URL/sessions" "${HEADERS[@]}" -d '{"place_name":"smoke-test","description":"backend smoke run"}')
SESSION_ID=$(python -c 'import json,sys; print(json.loads(sys.argv[1])["session"]["session_id"])' "$SESSION_JSON")
echo "session_id=$SESSION_ID"

curl -sS -X POST "$BASE_URL/sessions/$SESSION_ID/event" "${HEADERS[@]}" -d '{"event_type":"room_started","room_id":"room-1"}' >/dev/null
curl -sS -X POST "$BASE_URL/sessions/$SESSION_ID/frame" "${HEADERS[@]}" -d "{\"image_b64\":\"$JPEG_B64\",\"frame_id\":\"smoke_camera\",\"room_id\":\"room-1\"}" >/dev/null
curl -sS -X POST "$BASE_URL/sessions/$SESSION_ID/finish" "${HEADERS[@]}" >/dev/null
curl -sS "$BASE_URL/sessions/$SESSION_ID" | python -m json.tool

echo "Smoke test completed. Query MCP tool next (example): dimos mcp call temporal_memory_query --arg question='what did i scan?'"
