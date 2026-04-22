"use client"

import { useState, useEffect } from "react"
import { ProgressBand, ScanGuidance, RoomChip } from "@/components/echospace"
import { Button } from "@/components/ui/button"
import { Pause, Play, Check, Mic, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface LiveScanScreenProps {
  onBack: () => void
  onFinish: () => void
}

type GuidanceType = "move-slower" | "look-corners" | "door-detected" | "furniture-detected" | "need-coverage" | "good-progress" | "almost-done"

export function LiveScanScreen({ onBack, onFinish }: LiveScanScreenProps) {
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentGuidance, setCurrentGuidance] = useState<GuidanceType>("look-corners")
  const [rooms, setRooms] = useState([
    { id: "1", name: "Room 1", complete: false },
  ])

  // Simulate scanning progress
  useEffect(() => {
    if (isPaused) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 1
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isPaused])

  // Simulate guidance changes
  useEffect(() => {
    if (isPaused) return

    const guidanceTypes: GuidanceType[] = [
      "look-corners",
      "move-slower",
      "furniture-detected",
      "door-detected",
      "good-progress",
      "need-coverage",
      "almost-done",
    ]

    const interval = setInterval(() => {
      const randomGuidance =
        guidanceTypes[Math.floor(Math.random() * guidanceTypes.length)]
      setCurrentGuidance(randomGuidance)
    }, 3000)

    return () => clearInterval(interval)
  }, [isPaused])

  const handleCompleteRoom = () => {
    setRooms((prev) =>
      prev.map((room, i) =>
        i === prev.length - 1 ? { ...room, complete: true } : room
      )
    )
    // Add new room
    setRooms((prev) => [
      ...prev,
      { id: String(prev.length + 1), name: `Room ${prev.length + 1}`, complete: false },
    ])
    setProgress(0)
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-foreground">
      {/* Simulated Camera View */}
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/90 to-foreground">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-64 w-64">
            {/* Scanning grid visualization */}
            <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 gap-1 opacity-30">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "rounded-sm transition-opacity duration-500",
                    progress > i * 6 ? "bg-primary" : "bg-background/20"
                  )}
                />
              ))}
            </div>
            {/* Center reticle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full border-2 border-primary/50">
                <div className="absolute left-1/2 top-0 h-4 w-0.5 -translate-x-1/2 bg-primary/50" />
                <div className="absolute bottom-0 left-1/2 h-4 w-0.5 -translate-x-1/2 bg-primary/50" />
                <div className="absolute left-0 top-1/2 h-0.5 w-4 -translate-y-1/2 bg-primary/50" />
                <div className="absolute right-0 top-1/2 h-0.5 w-4 -translate-y-1/2 bg-primary/50" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Overlay */}
      <div className="relative z-10 flex flex-col gap-4 p-5 pt-safe">
        {/* Close Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            aria-label="Cancel scan"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-background/20 text-background backdrop-blur-md"
          >
            <X className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            {rooms.map((room) => (
              <RoomChip
                key={room.id}
                name={room.name}
                isComplete={room.complete}
                isActive={!room.complete}
                className="bg-background/20 backdrop-blur-md border-background/30 text-background"
              />
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="rounded-xl bg-background/20 p-4 backdrop-blur-md">
          <ProgressBand
            value={progress}
            label="Room Coverage"
            variant={progress > 80 ? "success" : "default"}
          />
        </div>

        {/* Guidance */}
        <div className="flex justify-center">
          <ScanGuidance type={currentGuidance} />
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="relative z-10 mt-auto p-5 pb-safe">
        {/* Paused State Overlay */}
        {isPaused && (
          <div className="mb-4 rounded-xl bg-warning/90 p-4 text-center text-warning-foreground">
            <p className="text-lg font-semibold">Scan Paused</p>
            <p className="text-sm opacity-80">
              Tap play to continue scanning
            </p>
          </div>
        )}

        <div className="flex items-center justify-between gap-4">
          {/* Pause/Play */}
          <Button
            onClick={() => setIsPaused(!isPaused)}
            variant="secondary"
            size="lg"
            className="h-14 flex-1 rounded-xl gap-2"
            aria-label={isPaused ? "Resume scan" : "Pause scan"}
          >
            {isPaused ? (
              <>
                <Play className="h-5 w-5" />
                Resume
              </>
            ) : (
              <>
                <Pause className="h-5 w-5" />
                Pause
              </>
            )}
          </Button>

          {/* Complete Room */}
          <Button
            onClick={handleCompleteRoom}
            disabled={progress < 60}
            size="lg"
            className="h-14 flex-1 rounded-xl gap-2"
          >
            <Check className="h-5 w-5" />
            Finish Room
          </Button>

          {/* Add Note */}
          <button
            aria-label="Add voice note"
            className="flex h-14 w-14 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"
          >
            <Mic className="h-6 w-6" />
          </button>
        </div>

        {/* Finish All */}
        {rooms.filter((r) => r.complete).length > 0 && (
          <Button
            onClick={onFinish}
            variant="outline"
            size="lg"
            className="mt-4 w-full h-14 rounded-xl bg-background/20 backdrop-blur-md border-background/30 text-background hover:bg-background/30"
          >
            Finish All Rooms ({rooms.filter((r) => r.complete).length} complete)
          </Button>
        )}
      </div>
    </div>
  )
}
