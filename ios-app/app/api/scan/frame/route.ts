import { NextResponse } from "next/server"

const DIMOS_WEB_SCAN_URL = process.env.DIMOS_WEB_SCAN_URL ?? "http://localhost:9991/webscan/frame"

export async function POST(request: Request) {
  const body = await request.json()

  const upstream = await fetch(DIMOS_WEB_SCAN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  })

  const text = await upstream.text()
  return new NextResponse(text, {
    status: upstream.status,
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "application/json",
    },
  })
}
