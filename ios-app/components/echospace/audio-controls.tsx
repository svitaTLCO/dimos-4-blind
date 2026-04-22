"use client"

import { cn } from "@/lib/utils"
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react"

interface AudioControlsProps {
  isPlaying: boolean
  onPlayPause: () => void
  onRestart?: () => void
  showVolume?: boolean
  onVolumeToggle?: () => void
  label?: string
  className?: string
}

export function AudioControls({
  isPlaying,
  onPlayPause,
  onRestart,
  showVolume = false,
  onVolumeToggle,
  label = "Audio description",
  className,
}: AudioControlsProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "flex items-center justify-center gap-3 rounded-2xl bg-card border border-border p-4",
        className
      )}
    >
      {onRestart && (
        <button
          onClick={onRestart}
          aria-label="Restart audio"
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full",
            "bg-secondary text-secondary-foreground",
            "touch-manipulation transition-colors hover:bg-secondary/80",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          )}
        >
          <RotateCcw className="h-5 w-5" />
        </button>
      )}

      <button
        onClick={onPlayPause}
        aria-label={isPlaying ? "Pause" : "Play"}
        className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full",
          "bg-primary text-primary-foreground",
          "touch-manipulation transition-all hover:bg-primary/90 active:scale-95",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        )}
      >
        {isPlaying ? (
          <Pause className="h-7 w-7" />
        ) : (
          <Play className="h-7 w-7 ml-1" />
        )}
      </button>

      {showVolume && onVolumeToggle && (
        <button
          onClick={onVolumeToggle}
          aria-label="Toggle volume"
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full",
            "bg-secondary text-secondary-foreground",
            "touch-manipulation transition-colors hover:bg-secondary/80",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          )}
        >
          <Volume2 className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}
