"use client"

import { useState, useEffect } from "react"
import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProcessingScreenProps {
  onComplete: (summary: string) => void
}

interface ProcessingStep {
  id: string
  label: string
  status: "pending" | "processing" | "complete"
}

export function ProcessingScreen({ onComplete }: ProcessingScreenProps) {
  const [summary, setSummary] = useState("Waiting for backend result...")
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { id: "1", label: "Analyzing scan data", status: "processing" },
    { id: "2", label: "Querying temporal memory", status: "pending" },
    { id: "3", label: "Building place overview", status: "pending" },
  ])

  useEffect(() => {
    const run = async () => {
      setSteps((prev) => [{ ...prev[0], status: "complete" }, { ...prev[1], status: "processing" }, prev[2]])
      const resp = await fetch("/api/dimos/mcp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "query", arguments: { question: "Summarize the latest scanned space in 2-3 sentences." } } }),
      })
      const data = await resp.json()
      const text = data?.result?.content?.[0]?.text ?? "No summary returned"
      setSummary(text)
      setSteps((prev) => [{ ...prev[0], status: "complete" }, { ...prev[1], status: "complete" }, { ...prev[2], status: "complete" }])
      setTimeout(() => onComplete(text), 800)
    }
    void run()
  }, [onComplete])

  const completedCount = steps.filter((s) => s.status === "complete").length
  const progress = Math.round((completedCount / steps.length) * 100)

  return <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12"><div className="flex w-full max-w-sm flex-col items-center gap-8"><div className="relative"><div className="h-24 w-24 rounded-full bg-primary/10"><svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" className="text-border" /><circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray={`${progress * 2.83} 283`} strokeLinecap="round" className="text-primary transition-all duration-500 ease-out" /></svg></div><div className="absolute inset-0 flex items-center justify-center"><span className="text-2xl font-bold tabular-nums">{progress}%</span></div></div><div className="w-full rounded-2xl border border-border bg-card p-5"><ul className="flex flex-col gap-3">{steps.map((step) => <li key={step.id} className="flex items-center gap-3"><div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all", step.status === "complete" && "bg-success text-success-foreground", step.status === "processing" && "bg-primary text-primary-foreground", step.status === "pending" && "bg-muted text-muted-foreground")}>{step.status === "complete" ? <Check className="h-4 w-4" /> : step.status === "processing" ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-xs font-medium">{step.id}</span>}</div><span className="text-sm font-medium">{step.label}</span></li>)}</ul></div><p className="text-center text-sm text-muted-foreground">{summary}</p></div></div>
}
