"use client"

import { TopAppBar, ActionCard, RoomChip, HazardBanner } from "@/components/echospace"
import { Volume2, LayoutGrid, Box, Footprints, Share2, DoorOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Place } from "@/lib/types"

interface PlaceOverviewScreenProps {
  place: Place
  onBack: () => void
  onOpenRoom: (roomId: string) => void
  onOpenMap: () => void
  onOpen3D: () => void
  onStartTour: () => void
  onShare: () => void
}

export function PlaceOverviewScreen({
  place,
  onBack,
  onOpenRoom,
  onOpenMap,
  onOpen3D,
  onStartTour,
  onShare,
}: PlaceOverviewScreenProps) {
  const entranceRoom = place.rooms.find((r) => r.isEntrance)
  const completedRooms = place.rooms.filter((r) => r.scanComplete)
  const allHazards = place.rooms.flatMap((r) => r.hazards)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopAppBar
        title={place.name}
        subtitle={`${place.rooms.length} rooms`}
        showBack
        onBack={onBack}
        rightAction={
          <button
            onClick={onShare}
            aria-label="Share place"
            className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-accent"
          >
            <Share2 className="h-5 w-5" />
          </button>
        }
      />

      <div className="flex flex-col gap-6 px-5 py-6 pb-8">
        {/* Status Header */}
        <div className="flex items-center justify-between rounded-xl bg-card border border-border p-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">Scan Quality</span>
            <span
              className={cn(
                "text-lg font-semibold",
                place.scanQuality === "good" && "text-success",
                place.scanQuality === "fair" && "text-warning-foreground",
                place.scanQuality === "needs-update" && "text-destructive"
              )}
            >
              {place.scanQuality === "good" && "Good"}
              {place.scanQuality === "fair" && "Fair"}
              {place.scanQuality === "needs-update" && "Needs Update"}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-sm text-muted-foreground">Rooms Scanned</span>
            <span className="text-lg font-semibold tabular-nums">
              {completedRooms.length}/{place.rooms.length}
            </span>
          </div>
        </div>

        {/* Main Entrance */}
        {entranceRoom && (
          <div className="flex items-center gap-3 rounded-xl bg-secondary p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-background">
              <DoorOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-sm text-muted-foreground">Main Entrance</span>
              <span className="font-medium">{entranceRoom.name}</span>
            </div>
          </div>
        )}

        {/* Primary Actions */}
        <section className="flex flex-col gap-3" aria-labelledby="actions-heading">
          <h2 id="actions-heading" className="sr-only">Explore Actions</h2>

          <ActionCard
            title="Hear Summary"
            description="Listen to a spoken overview of this place"
            icon={<Volume2 className="h-6 w-6" />}
            variant="primary"
            onClick={() => {}}
          />

          <div className="grid grid-cols-2 gap-3">
            <ActionCard
              title="Tactile Map"
              description="Touch to explore"
              icon={<LayoutGrid className="h-6 w-6" />}
              onClick={onOpenMap}
              className="flex-col items-center text-center"
            />
            <ActionCard
              title="3D View"
              description="Spatial model"
              icon={<Box className="h-6 w-6" />}
              onClick={onOpen3D}
              className="flex-col items-center text-center"
            />
          </div>

          <ActionCard
            title="Guided Tour"
            description="Step-by-step audio walkthrough"
            icon={<Footprints className="h-6 w-6" />}
            onClick={onStartTour}
          />
        </section>

        {/* Hazards Warning */}
        {allHazards.length > 0 && (
          <section aria-labelledby="hazards-heading">
            <h2
              id="hazards-heading"
              className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground px-1"
            >
              Hazards ({allHazards.length})
            </h2>
            <div className="flex flex-col gap-2">
              {allHazards.slice(0, 2).map((hazard) => (
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

        {/* Rooms */}
        <section aria-labelledby="rooms-heading">
          <h2
            id="rooms-heading"
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground px-1"
          >
            Rooms
          </h2>
          <div className="flex flex-wrap gap-2">
            {place.rooms.map((room) => (
              <RoomChip
                key={room.id}
                name={room.name}
                isEntrance={room.isEntrance}
                isComplete={room.scanComplete}
                onClick={() => onOpenRoom(room.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
