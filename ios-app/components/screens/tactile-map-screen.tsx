"use client"

import { useState } from "react"
import { TopAppBar } from "@/components/echospace"
import { cn } from "@/lib/utils"
import { DoorOpen, MapPin, AlertTriangle } from "lucide-react"
import type { Place } from "@/lib/types"

interface TactileMapScreenProps {
  place: Place
  selectedRoomId?: string
  onBack: () => void
  onSelectRoom: (roomId: string) => void
}

// Simple grid-based room layout positions
const roomPositions: Record<string, { row: number; col: number; rowSpan?: number; colSpan?: number }> = {
  lobby: { row: 1, col: 2, colSpan: 2 },
  hallway: { row: 2, col: 2, colSpan: 2 },
  "meeting-a": { row: 2, col: 1 },
  "meeting-b": { row: 2, col: 4 },
  cafeteria: { row: 3, col: 2, colSpan: 2 },
  restrooms: { row: 1, col: 1 },
  kitchen: { row: 3, col: 4 },
  entrance: { row: 1, col: 2 },
  "main-reading": { row: 2, col: 1, colSpan: 2 },
  "computer-lab": { row: 2, col: 3 },
}

export function TactileMapScreen({
  place,
  selectedRoomId,
  onBack,
  onSelectRoom,
}: TactileMapScreenProps) {
  const [activeRoom, setActiveRoom] = useState<string | null>(selectedRoomId || null)
  const activeRoomData = activeRoom ? place.rooms.find((r) => r.id === activeRoom) : null

  const handleRoomPress = (roomId: string) => {
    setActiveRoom(roomId)
    // Vibrate for haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(50)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopAppBar
        title="Tactile Map"
        subtitle={place.name}
        showBack
        onBack={onBack}
      />

      <div className="flex flex-1 flex-col">
        {/* Map Area */}
        <div
          className="flex-1 p-4"
          role="application"
          aria-label={`Tactile map of ${place.name}. Touch rooms to explore.`}
        >
          <div className="grid h-full grid-cols-4 grid-rows-4 gap-2 p-2 rounded-2xl bg-card border border-border">
            {place.rooms.map((room) => {
              const pos = roomPositions[room.id] || { row: 1, col: 1 }
              const isActive = activeRoom === room.id
              const hasHazards = room.hazards.length > 0

              return (
                <button
                  key={room.id}
                  onClick={() => handleRoomPress(room.id)}
                  onDoubleClick={() => onSelectRoom(room.id)}
                  aria-label={`${room.name}${room.isEntrance ? ", main entrance" : ""}${hasHazards ? ", has hazards" : ""}. Double tap for details.`}
                  aria-pressed={isActive}
                  style={{
                    gridRow: `${pos.row} / span ${pos.rowSpan || 1}`,
                    gridColumn: `${pos.col} / span ${pos.colSpan || 1}`,
                  }}
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-xl p-3",
                    "min-h-[80px] touch-manipulation transition-all",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    isActive
                      ? "bg-primary text-primary-foreground scale-[1.02] shadow-lg"
                      : room.scanComplete
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-muted-foreground border-2 border-dashed border-border",
                    "active:scale-95"
                  )}
                >
                  {room.isEntrance && (
                    <DoorOpen
                      className="absolute top-2 left-2 h-4 w-4"
                      aria-hidden="true"
                    />
                  )}
                  {hasHazards && (
                    <AlertTriangle
                      className={cn(
                        "absolute top-2 right-2 h-4 w-4",
                        isActive ? "text-primary-foreground" : "text-warning-foreground"
                      )}
                      aria-hidden="true"
                    />
                  )}
                  <span className="text-sm font-semibold text-center leading-tight">
                    {room.name}
                  </span>
                  {room.landmarks.length > 0 && (
                    <span className="mt-1 text-xs opacity-70">
                      {room.landmarks.length} landmarks
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Room Info Panel */}
        <div
          className="border-t border-border bg-card p-5"
          role="region"
          aria-live="polite"
          aria-label="Selected room information"
        >
          {activeRoomData ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{activeRoomData.name}</h2>
                {activeRoomData.isEntrance && (
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    Entrance
                  </span>
                )}
              </div>

              {activeRoomData.description && (
                <p className="text-base text-muted-foreground">
                  {activeRoomData.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  <span>{activeRoomData.landmarks.length} landmarks</span>
                </div>
                {activeRoomData.hazards.length > 0 && (
                  <div className="flex items-center gap-1.5 text-warning-foreground">
                    <AlertTriangle className="h-4 w-4" />
                    <span>{activeRoomData.hazards.length} hazards</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => onSelectRoom(activeRoomData.id)}
                className="mt-2 w-full rounded-xl bg-primary py-3.5 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                View Room Details
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <p className="text-base text-muted-foreground">
                Touch a room on the map to explore
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Double tap for full details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
