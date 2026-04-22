"use client"

import { useState, useEffect } from "react"
import { Check, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProcessingScreenProps {
  onComplete: () => void
}

interface ProcessingStep {
  id: string
  label: string
  status: "pending" | "processing" | "complete"
}

export function ProcessingScreen({ onComplete }: ProcessingScreenProps) {
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { id: "1", label: "Analyzing scan data", status: "processing" },
    { id: "2", label: "Detecting room boundaries", status: "pending" },
    { id: "3", label: "Identifying landmarks", status: "pending" },
    { id: "4", label: "Mapping connections", status: "pending" },
    { id: "5", label: "Generating spatial model", status: "pending" },
    { id: "6", label: "Creating audio descriptions", status: "pending" },
  ])

  useEffect(() => {
    let currentIndex = 0

    const interval = setInterval(() => {
      setSteps((prev) => {
        const newSteps = [...prev]

        // Complete current step
        if (currentIndex < newSteps.length) {
          newSteps[currentIndex].status = "complete"
        }

        // Start next step
        if (currentIndex + 1 < newSteps.length) {
          newSteps[currentIndex + 1].status = "processing"
        }

        return newSteps
      })

      currentIndex++

      if (currentIndex >= steps.length) {
        clearInterval(interval)
        setTimeout(onComplete, 1000)
      }
    }, 1200)

    return () => clearInterval(interval)
  }, [onComplete, steps.length])

  const completedCount = steps.filter((s) => s.status === "complete").length
  const progress = Math.round((completedCount / steps.length) * 100)

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        {/* Animated Icon */}
        <div className="relative">
          <div className="h-24 w-24 rounded-full bg-primary/10">
            <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-border"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={`${progress * 2.83} 283`}
                strokeLinecap="round"
                className="text-primary transition-all duration-500 ease-out"
              />
            </svg>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold tabular-nums">{progress}%</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl font-bold">Processing Your Scan</h1>
          <p className="mt-2 text-base text-muted-foreground">
            Building your spatial model
          </p>
        </div>

        {/* Steps */}
        <div className="w-full rounded-2xl border border-border bg-card p-5">
          <ul className="flex flex-col gap-3" role="list" aria-label="Processing steps">
            {steps.map((step) => (
              <li
                key={step.id}
                className="flex items-center gap-3"
                aria-current={step.status === "processing" ? "step" : undefined}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all",
                    step.status === "complete" && "bg-success text-success-foreground",
                    step.status === "processing" && "bg-primary text-primary-foreground",
                    step.status === "pending" && "bg-muted text-muted-foreground"
                  )}
                >
                  {step.status === "complete" ? (
                    <Check className="h-4 w-4" />
                  ) : step.status === "processing" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="text-xs font-medium">{step.id}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-sm font-medium transition-colors",
                    step.status === "complete" && "text-success",
                    step.status === "processing" && "text-foreground",
                    step.status === "pending" && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Status Message */}
        <p className="text-center text-sm text-muted-foreground">
          {completedCount === steps.length
            ? "Processing complete!"
            : "This may take a moment..."}
        </p>
      </div>
    </div>
  )
}
