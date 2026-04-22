"use client"

import { cn } from "@/lib/utils"
import { AlertTriangle } from "lucide-react"

interface HazardBannerProps {
  title: string
  description?: string
  severity?: "warning" | "danger"
  className?: string
}

export function HazardBanner({
  title,
  description,
  severity = "warning",
  className,
}: HazardBannerProps) {
  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "flex items-start gap-3 rounded-xl p-4",
        severity === "warning" && "bg-warning/10 border border-warning/20",
        severity === "danger" && "bg-destructive/10 border border-destructive/20",
        className
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          severity === "warning" && "bg-warning/20 text-warning-foreground",
          severity === "danger" && "bg-destructive/20 text-destructive"
        )}
        aria-hidden="true"
      >
        <AlertTriangle className="h-5 w-5" />
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span
          className={cn(
            "text-base font-semibold",
            severity === "warning" && "text-warning-foreground",
            severity === "danger" && "text-destructive"
          )}
        >
          {title}
        </span>
        {description && (
          <span className="text-sm text-muted-foreground">{description}</span>
        )}
      </div>
    </div>
  )
}
