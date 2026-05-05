import { NextResponse } from "next/server"
const BASE=(process.env.DIMOS_WEB_SCAN_URL??"http://127.0.0.1:9991").replace(/\/$/,"")
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const sessionId = body?.session_id as string | undefined
    const path = sessionId ? `/webscan/sessions/${sessionId}/frame` : "/webscan/frame"
    const upstream = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: {"Content-Type": "application/json", ...(process.env.DIMOS_WEB_SCAN_TOKEN ? { Authorization: `Bearer ${process.env.DIMOS_WEB_SCAN_TOKEN}` } : {})},
      body: JSON.stringify(body), cache: "no-store",
    })
    return new NextResponse(await upstream.text(), {status: upstream.status, headers: {"Content-Type": upstream.headers.get("content-type") ?? "application/json"}})
  } catch (e) {
    return NextResponse.json({ ok: false, error: `backend unreachable: ${String(e)}` }, { status: 502 })
  }
}
