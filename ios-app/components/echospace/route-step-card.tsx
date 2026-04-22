"use client"

import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"

interface RouteStepCardProps {
  currentStep: number
  totalSteps: number
  instruction: string
  landmark?: string
  distance?: string
  onPrevious?: () => void
  onNext?: () => void
  onRepeat?: () => void
  hasPrevious?: boolean
  hasNext?: boolean
  className?: string
}

export function RouteStepCard({
  currentStep,
  totalSteps,
  instruction,
  landmark,
  distance,
  onPrevious,
  onNext,
  onRepeat,
  hasPrevious = true,
  hasNext = true,
  className,
}: RouteStepCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-2xl bg-card border border-border p-5",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </span>
        {distance && (
          <span className="text-sm text-muted-foreground">{distance}</span>
        )}
      </div>

      <div className="flex flex-col gap-2 py-2">
        <p className="text-xl font-semibold leading-tight">{instruction}</p>
        {landmark && (
          <p className="text-base text-muted-foreground">
            Near: {landmark}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={onPrevious}
          disabled={!hasPrevious}
          aria-label="Previous step"
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full",
            "bg-secondary text-secondary-foreground",
            "touch-manipulation transition-colors",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            !hasPrevious && "opacity-40 cursor-not-allowed"
          )}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          onClick={onRepeat}
          aria-label="Repeat instruction"
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full",
            "bg-primary/10 text-primary",
            "touch-manipulation transition-colors hover:bg-primary/20",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          )}
        >
          <RotateCcw className="h-6 w-6" />
        </button>

        <button
          onClick={onNext}
          disabled={!hasNext}
          aria-label="Next step"
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-full",
            "bg-primary text-primary-foreground",
            "touch-manipulation transition-colors hover:bg-primary/90",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            !hasNext && "opacity-40 cursor-not-allowed"
          )}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
