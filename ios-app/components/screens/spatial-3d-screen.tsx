"use client"

import { useState } from "react"
import { TopAppBar } from "@/components/echospace"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { RotateCcw, ZoomIn, ZoomOut, Focus, Home } from "lucide-react"
import type { Place } from "@/lib/types"

interface Spatial3DScreenProps {
  place: Place
  onBack: () => void
}

type ViewMode = "overview" | "room" | "route"

export function Spatial3DScreen({ place, onBack }: Spatial3DScreenProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("overview")
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)

  const selectedRoom = selectedRoomId
    ? place.rooms.find((r) => r.id === selectedRoomId)
    : null

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 2))
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5))
  const handleReset = () => {
    setZoomLevel(1)
    setSelectedRoomId(null)
    setViewMode("overview")
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopAppBar
        title="3D View"
        subtitle={place.name}
        showBack
        onBack={onBack}
        variant="blur"
      />

      {/* 3D Viewport */}
      <div
        className="relative flex-1 bg-gradient-to-b from-muted to-background overflow-hidden"
        role="img"
        aria-label={`Simplified 3D spatial view of ${place.name}. ${place.rooms.length} rooms shown.`}
      >
        {/* Simplified 3D Scene Representation */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: `scale(${zoomLevel})`, transition: "transform 0.3s ease-out" }}
        >
          <div className="relative w-80 h-64">
            {/* Floor Grid */}
            <div className="absolute inset-0 grid grid-cols-6 grid-rows-5 gap-0.5 opacity-20">
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="bg-border" />
              ))}
            </div>

            {/* 3D Room Blocks */}
            <div className="absolute inset-0">
              {place.rooms.slice(0, 6).map((room, index) => {
                const positions = [
                  { left: "10%", top: "10%", width: "35%", height: "40%" },
                  { left: "50%", top: "10%", width: "40%", height: "35%" },
                  { left: "10%", top: "55%", width: "30%", height: "35%" },
                  { left: "45%", top: "50%", width: "45%", height: "40%" },
                  { left: "75%", top: "15%", width: "20%", height: "30%" },
                  { left: "5%", top: "75%", width: "25%", height: "20%" },
                ]
                const pos = positions[index] || positions[0]
                const isSelected = selectedRoomId === room.id
                const isEntrance = room.isEntrance

                return (
                  <button
                    key={room.id}
                    onClick={() => {
                      setSelectedRoomId(room.id)
                      setViewMode("room")
                    }}
                    aria-label={`${room.name}${isEntrance ? ", main entrance" : ""}`}
                    aria-pressed={isSelected}
                    style={pos}
                    className={cn(
                      "absolute rounded-lg transition-all duration-300",
                      "flex flex-col items-center justify-center p-2",
                      "shadow-lg hover:shadow-xl",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      isSelected
                        ? "bg-primary text-primary-foreground z-10 scale-105"
                        : isEntrance
                          ? "bg-success/80 text-success-foreground"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                  >
                    <span className="text-xs font-medium text-center leading-tight truncate w-full">
                      {room.name}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
              <line x1="45%" y1="30%" x2="50%" y2="30%" stroke="currentColor" strokeWidth="2" strokeDasharray="4" className="text-border" />
              <line x1="25%" y1="50%" x2="25%" y2="55%" stroke="currentColor" strokeWidth="2" strokeDasharray="4" className="text-border" />
              <line x1="68%" y1="50%" x2="68%" y2="50%" stroke="currentColor" strokeWidth="2" strokeDasharray="4" className="text-border" />
            </svg>
          </div>
        </div>

        {/* View Mode Pills */}
        <div className="absolute top-4 left-4 right-4 flex justify-center">
          <div className="flex gap-1 rounded-full bg-background/80 p-1 backdrop-blur-md">
            {(["overview", "room", "route"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  viewMode === mode
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute right-4 bottom-4 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            aria-label="Zoom in"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-background/80 backdrop-blur-md shadow-lg hover:bg-background transition-colors"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button
            onClick={handleZoomOut}
            aria-label="Zoom out"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-background/80 backdrop-blur-md shadow-lg hover:bg-background transition-colors"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <button
            onClick={handleReset}
            aria-label="Reset view"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-background/80 backdrop-blur-md shadow-lg hover:bg-background transition-colors"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Info Panel */}
      <div className="border-t border-border bg-card p-5">
        {selectedRoom ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Focus className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-semibold">{selectedRoom.name}</h2>
              </div>
              <button
                onClick={() => {
                  setSelectedRoomId(null)
                  setViewMode("overview")
                }}
                className="text-sm text-primary font-medium"
              >
                Clear Focus
              </button>
            </div>
            {selectedRoom.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {selectedRoom.description}
              </p>
            )}
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" className="flex-1 rounded-lg">
                <Home className="h-4 w-4 mr-2" />
                Start Here
              </Button>
              <Button size="sm" className="flex-1 rounded-lg">
                Walk Through
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-base text-muted-foreground">
              Tap a room to focus on it
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Use pinch or buttons to zoom
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
