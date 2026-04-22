"use client"

import { useState } from "react"
import { TopAppBar, LandmarkRow, HazardBanner, AudioControls, RoomChip } from "@/components/echospace"
import { Button } from "@/components/ui/button"
import { 
  MapPin, 
  Sofa, 
  DoorOpen, 
  LayoutGrid,
  ArrowRight
} from "lucide-react"
import type { Room, Place, Landmark } from "@/lib/types"

interface RoomDetailScreenProps {
  room: Room
  place: Place
  onBack: () => void
  onOpenMap: () => void
}

const landmarkIcons: Record<Landmark["type"], React.ReactNode> = {
  furniture: <Sofa className="h-5 w-5" />,
  fixture: <MapPin className="h-5 w-5" />,
  entrance: <DoorOpen className="h-5 w-5" />,
  exit: <DoorOpen className="h-5 w-5" />,
  custom: <MapPin className="h-5 w-5" />,
}

export function RoomDetailScreen({
  room,
  place,
  onBack,
  onOpenMap,
}: RoomDetailScreenProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const connectedRooms = room.connections
    .map((conn) => place.rooms.find((r) => r.id === conn.roomId))
    .filter(Boolean)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopAppBar
        title={room.name}
        subtitle={room.isEntrance ? "Main Entrance" : undefined}
        showBack
        onBack={onBack}
      />

      <div className="flex flex-col gap-6 px-5 py-6 pb-8">
        {/* Audio Summary */}
        <section aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="sr-only">
            Room Audio Summary
          </h2>
          <div className="rounded-2xl bg-card border border-border p-5">
            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              {room.description || "No description available for this room."}
            </p>
            <AudioControls
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              onRestart={() => setIsPlaying(true)}
              label="Hear room description"
            />
          </div>
        </section>

        {/* Landmarks */}
        {room.landmarks.length > 0 && (
          <section aria-labelledby="landmarks-heading">
            <h2
              id="landmarks-heading"
              className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground px-1"
            >
              Landmarks ({room.landmarks.length})
            </h2>
            <div className="rounded-2xl bg-card border border-border overflow-hidden">
              <div className="flex flex-col divide-y divide-border">
                {room.landmarks.map((landmark) => (
                  <LandmarkRow
                    key={landmark.id}
                    name={landmark.name}
                    description={landmark.description}
                    icon={landmarkIcons[landmark.type]}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Hazards */}
        {room.hazards.length > 0 && (
          <section aria-labelledby="hazards-heading">
            <h2
              id="hazards-heading"
              className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground px-1"
            >
              Hazards ({room.hazards.length})
            </h2>
            <div className="flex flex-col gap-2">
              {room.hazards.map((hazard) => (
                <HazardBanner
                  key={hazard.id}
                  title={hazard.name}
                  description={hazard.description}
                  severity={hazard.severity}
                />
              ))}
            </div>
          </section>
        )}

        {/* Connected Rooms */}
        {connectedRooms.length > 0 && (
          <section aria-labelledby="connections-heading">
            <h2
              id="connections-heading"
              className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground px-1"
            >
              Connected Rooms
            </h2>
            <div className="rounded-2xl bg-card border border-border p-4">
              <div className="flex flex-wrap gap-2">
                {connectedRooms.map((connectedRoom) => {
                  const connection = room.connections.find(
                    (c) => c.roomId === connectedRoom!.id
                  )
                  return (
                    <div key={connectedRoom!.id} className="flex items-center gap-2">
                      <RoomChip
                        name={connectedRoom!.name}
                        isEntrance={connectedRoom!.isEntrance}
                        isComplete={connectedRoom!.scanComplete}
                      />
                      {connection?.direction && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <ArrowRight className="h-3 w-3" />
                          {connection.direction}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={onOpenMap}
            size="lg"
            variant="outline"
            className="w-full h-14 rounded-xl gap-2"
          >
            <LayoutGrid className="h-5 w-5" />
            Open in Map
          </Button>
        </div>
      </div>
    </div>
  )
}
