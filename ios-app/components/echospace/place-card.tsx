"use client"

import { cn } from "@/lib/utils"
import { MapPin, DoorOpen, ChevronRight } from "lucide-react"

interface PlaceCardProps {
  name: string
  roomCount: number
  mainEntrance?: string
  lastAccessed?: string
  scanQuality?: "good" | "fair" | "needs-update"
  onClick?: () => void
  className?: string
}

export function PlaceCard({
  name,
  roomCount,
  mainEntrance,
  lastAccessed,
  scanQuality = "good",
  onClick,
  className,
}: PlaceCardProps) {
  return (
    <button
      onClick={onClick}
      aria-label={`${name}. ${roomCount} rooms${mainEntrance ? `. Main entrance: ${mainEntrance}` : ""}`}
      className={cn(
        "flex w-full flex-col gap-3 rounded-2xl border border-border bg-card p-5 text-left",
        "min-h-[120px] touch-manipulation transition-all",
        "hover:border-primary/30 hover:shadow-sm",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "active:scale-[0.99]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"
            aria-hidden="true"
          >
            <MapPin className="h-6 w-6" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h3 className="text-lg font-semibold">{name}</h3>
            <span className="text-sm text-muted-foreground">
              {roomCount} {roomCount === 1 ? "room" : "rooms"}
            </span>
          </div>
        </div>
        <ChevronRight
          className="h-5 w-5 text-muted-foreground mt-1"
          aria-hidden="true"
        />
      </div>

      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border">
        {mainEntrance && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <DoorOpen className="h-4 w-4" aria-hidden="true" />
            <span>{mainEntrance}</span>
          </div>
        )}
        <div className="flex items-center gap-2 ml-auto">
          {lastAccessed && (
            <span className="text-xs text-muted-foreground">{lastAccessed}</span>
          )}
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              scanQuality === "good" && "bg-success/10 text-success",
              scanQuality === "fair" && "bg-warning/10 text-warning-foreground",
              scanQuality === "needs-update" &&
                "bg-destructive/10 text-destructive"
            )}
          >
            {scanQuality === "good" && "Good"}
            {scanQuality === "fair" && "Fair"}
            {scanQuality === "needs-update" && "Update"}
          </span>
        </div>
      </div>
    </button>
  )
}
