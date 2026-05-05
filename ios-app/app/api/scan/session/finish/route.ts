import { NextResponse } from "next/server"

const DIMOS_WEB_SCAN_SESSION_BASE = process.env.DIMOS_WEB_SCAN_SESSION_BASE_URL ?? "http://localhost:9991/webscan/sessions"

export async function POST(request: Request) {
  const body = await request.json()
  const sessionId = body?.session_id as string | undefined
  if (!sessionId) {
    return NextResponse.json({ ok: false, error: "session_id required" }, { status: 400 })
  }
  const upstream = await fetch(`${DIMOS_WEB_SCAN_SESSION_BASE}/${sessionId}/finish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.DIMOS_WEB_SCAN_TOKEN ? { Authorization: `Bearer ${process.env.DIMOS_WEB_SCAN_TOKEN}` } : {}),
    },
    cache: "no-store",
  })
  const text = await upstream.text()
  return new NextResponse(text, { status: upstream.status, headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" } })
}
