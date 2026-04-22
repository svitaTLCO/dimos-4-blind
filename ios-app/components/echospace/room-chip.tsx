"use client"

import { cn } from "@/lib/utils"
import { DoorOpen, Check } from "lucide-react"

interface RoomChipProps {
  name: string
  isComplete?: boolean
  isActive?: boolean
  isEntrance?: boolean
  onClick?: () => void
  className?: string
}

export function RoomChip({
  name,
  isComplete = false,
  isActive = false,
  isEntrance = false,
  onClick,
  className,
}: RoomChipProps) {
  return (
    <button
      onClick={onClick}
      aria-label={`${name}${isEntrance ? ", main entrance" : ""}${isComplete ? ", scan complete" : ""}`}
      aria-pressed={isActive}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium",
        "min-h-[44px] touch-manipulation transition-all",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        isActive
          ? "bg-primary text-primary-foreground"
          : isComplete
            ? "bg-success/10 text-success border border-success/20"
            : "bg-secondary text-secondary-foreground border border-border",
        className
      )}
    >
      {isEntrance && (
        <DoorOpen className="h-4 w-4" aria-hidden="true" />
      )}
      <span>{name}</span>
      {isComplete && (
        <Check className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  )
}
