import { NextResponse } from "next/server"

const DIMOS_MCP_URL = process.env.DIMOS_MCP_URL ?? "http://localhost:9990/mcp"

export async function POST(request: Request) {
  const body = await request.json()
  const upstream = await fetch(DIMOS_MCP_URL, {
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
