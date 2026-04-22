"use client"

import { cn } from "@/lib/utils"

type GuidanceType =
  | "move-slower"
  | "look-corners"
  | "door-detected"
  | "furniture-detected"
  | "need-coverage"
  | "good-progress"
  | "almost-done"

interface ScanGuidanceProps {
  type: GuidanceType
  className?: string
}

const guidanceConfig: Record<GuidanceType, { message: string; variant: "info" | "success" | "warning" }> = {
  "move-slower": { message: "Move slower for better detail", variant: "warning" },
  "look-corners": { message: "Look at corners and edges", variant: "info" },
  "door-detected": { message: "Door detected", variant: "success" },
  "furniture-detected": { message: "Furniture detected", variant: "success" },
  "need-coverage": { message: "Need more coverage", variant: "warning" },
  "good-progress": { message: "Good progress", variant: "success" },
  "almost-done": { message: "Almost done with this area", variant: "success" },
}

export function ScanGuidance({ type, className }: ScanGuidanceProps) {
  const config = guidanceConfig[type]

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2.5",
        "text-sm font-medium backdrop-blur-md",
        config.variant === "info" && "bg-primary/90 text-primary-foreground",
        config.variant === "success" && "bg-success/90 text-success-foreground",
        config.variant === "warning" && "bg-warning/90 text-warning-foreground",
        className
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full animate-pulse",
          config.variant === "info" && "bg-primary-foreground",
          config.variant === "success" && "bg-success-foreground",
          config.variant === "warning" && "bg-warning-foreground"
        )}
        aria-hidden="true"
      />
      {config.message}
    </div>
  )
}
