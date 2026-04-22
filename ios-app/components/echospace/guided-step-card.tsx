"use client"

import { cn } from "@/lib/utils"

interface GuidedStepCardProps {
  stepNumber: number
  totalSteps: number
  title: string
  description: string
  safetyNote?: string
  isActive?: boolean
  isComplete?: boolean
  className?: string
}

export function GuidedStepCard({
  stepNumber,
  totalSteps,
  title,
  description,
  safetyNote,
  isActive = false,
  isComplete = false,
  className,
}: GuidedStepCardProps) {
  return (
    <div
      role="listitem"
      aria-current={isActive ? "step" : undefined}
      className={cn(
        "rounded-2xl border p-5 transition-all",
        isActive && "border-primary bg-primary/5 shadow-sm",
        isComplete && "border-success/30 bg-success/5",
        !isActive && !isComplete && "border-border bg-card",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold",
            isActive && "bg-primary text-primary-foreground",
            isComplete && "bg-success text-success-foreground",
            !isActive && !isComplete && "bg-muted text-muted-foreground"
          )}
          aria-hidden="true"
        >
          {isComplete ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            stepNumber
          )}
        </div>
        <div className="flex flex-col gap-2 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            <span className="text-sm text-muted-foreground tabular-nums">
              {stepNumber}/{totalSteps}
            </span>
          </div>
          <p className="text-base text-muted-foreground leading-relaxed">
            {description}
          </p>
          {safetyNote && (
            <div className="mt-2 flex items-start gap-2 rounded-lg bg-warning/10 px-3 py-2">
              <svg
                className="h-5 w-5 shrink-0 text-warning-foreground mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="text-sm text-warning-foreground font-medium">
                {safetyNote}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
