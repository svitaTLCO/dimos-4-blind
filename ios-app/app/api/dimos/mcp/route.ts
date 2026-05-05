import { NextResponse } from "next/server"
const DIMOS_MCP_URL = process.env.DIMOS_MCP_URL ?? "http://localhost:9990/mcp"
export async function POST(request: Request) {
  try {
    const upstream = await fetch(DIMOS_MCP_URL, {method: "POST", headers: {"Content-Type": "application/json", ...(process.env.DIMOS_WEB_SCAN_TOKEN ? { Authorization: `Bearer ${process.env.DIMOS_WEB_SCAN_TOKEN}` } : {})}, body: JSON.stringify(await request.json()), cache: "no-store"})
    return new NextResponse(await upstream.text(), {status: upstream.status, headers: {"Content-Type": upstream.headers.get("content-type") ?? "application/json"}})
  } catch (e) {
    return NextResponse.json({ ok: false, error: `mcp unreachable: ${String(e)}` }, { status: 502 })
  }
}
