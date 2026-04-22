"use client"

import { cn } from "@/lib/utils"

interface ProgressBandProps {
  value: number
  max?: number
  label?: string
  showPercentage?: boolean
  variant?: "default" | "success" | "warning"
  className?: string
}

export function ProgressBand({
  value,
  max = 100,
  label,
  showPercentage = true,
  variant = "default",
  className,
}: ProgressBandProps) {
  const percentage = Math.round((value / max) * 100)

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label || `Progress: ${percentage}%`}
      className={cn("flex flex-col gap-2", className)}
    >
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-medium">{label}</span>}
          {showPercentage && (
            <span className="text-muted-foreground tabular-nums">
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-out",
            variant === "default" && "bg-primary",
            variant === "success" && "bg-success",
            variant === "warning" && "bg-warning"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
