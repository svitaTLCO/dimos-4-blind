"use client"
import { useEffect, useState } from "react"
import { Check, Loader2 } from "lucide-react"

interface ProcessingScreenProps { onComplete: (summary: string) => void }

export function ProcessingScreen({ onComplete }: ProcessingScreenProps) {
  const [summary, setSummary] = useState("Waiting for backend result...")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const query = async (): Promise<string> => {
      const resp = await fetch("/api/dimos/mcp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "query", arguments: { question: "Summarize the latest scanned space." } } }) })
      if (!resp.ok) throw new Error(`MCP HTTP ${resp.status}`)
      const data = await resp.json()
      if (data?.error) throw new Error(String(data.error.message ?? "MCP error"))
      return data?.result?.content?.[0]?.text ?? "No summary returned"
    }
    const run = async () => {
      for (let i = 0; i < 5; i++) {
        try {
          const text = await query()
          if (text.includes("no frames available") || text === "No summary returned") {
            if (i === 4) {
              setError("No usable backend summary yet. Please scan a bit longer and retry.")
              setSummary("Temporal memory is still warming up.")
              setTimeout(() => onComplete(""), 500)
              return
            }
            await new Promise((r) => setTimeout(r, 2000))
            continue
          }
          setSummary(text)
          setTimeout(() => onComplete(text), 500)
          return
        } catch (e) {
          if (i === 4) {
            const msg = e instanceof Error ? e.message : "Backend error"
            setError(msg)
            setSummary("Backend processing failed.")
            setTimeout(() => onComplete(""), 500)
            return
          }
          await new Promise((r) => setTimeout(r, 2000))
        }
      }
    }
    void run()
  }, [onComplete])

  return <div className="flex min-h-screen flex-col items-center justify-center gap-4"><Loader2 className="h-8 w-8 animate-spin" /><p>{summary}</p>{error ? <p className="text-sm text-red-500">{error}</p> : <Check className="h-5 w-5 text-green-600" />}</div>
}
