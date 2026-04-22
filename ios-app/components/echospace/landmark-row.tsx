"use client"

import { cn } from "@/lib/utils"
import { MapPin, ChevronRight } from "lucide-react"

interface LandmarkRowProps {
  name: string
  description?: string
  icon?: React.ReactNode
  onClick?: () => void
  className?: string
}

export function LandmarkRow({
  name,
  description,
  icon,
  onClick,
  className,
}: LandmarkRowProps) {
  return (
    <button
      onClick={onClick}
      aria-label={description ? `${name}. ${description}` : name}
      className={cn(
        "flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-left",
        "min-h-[56px] touch-manipulation transition-colors",
        "hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        className
      )}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground"
        aria-hidden="true"
      >
        {icon || <MapPin className="h-5 w-5" />}
      </div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-base font-medium truncate">{name}</span>
        {description && (
          <span className="text-sm text-muted-foreground truncate">
            {description}
          </span>
        )}
      </div>
      <ChevronRight
        className="h-5 w-5 text-muted-foreground shrink-0"
        aria-hidden="true"
      />
    </button>
  )
}
