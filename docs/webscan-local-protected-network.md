# Web Scan Local Protected Network

```bash
export DIMOS_WEB_SCAN_TOKEN="local-dev-token"
export OPENAI_API_KEY="..."
dimos --new-memory --viewer none --mcp-host 127.0.0.1 --mcp-port 9990 run web-scan-temporal-memory-mcp --daemon
```

Health check:

```bash
curl -H "Authorization: Bearer local-dev-token" http://127.0.0.1:9991/webscan/health
```

Smoke test:

```bash
python scripts/webscan_smoke_test.py
```

Web app env:

```bash
DIMOS_WEB_SCAN_URL=http://127.0.0.1:9991
DIMOS_MCP_URL=http://127.0.0.1:9990/mcp
DIMOS_WEB_SCAN_TOKEN=local-dev-token
NEXT_PUBLIC_DIMOS_CAPTURE_FPS=1
NEXT_PUBLIC_USE_MOCK_DATA=false
```

iPhone/LAN guidance:
- expose only Next.js port to phone.
- keep DimOS endpoints localhost unless explicit LAN testing.
- if binding DimOS to LAN, use firewall/VPN + bearer token.
