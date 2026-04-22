"use client"

import { PlaceCard, EmptyState } from "@/components/echospace"
import { MapPin, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Place } from "@/lib/types"

interface PlacesScreenProps {
  places: Place[]
  onOpenPlace: (placeId: string) => void
  onNewScan: () => void
}

export function PlacesScreen({
  places,
  onOpenPlace,
  onNewScan,
}: PlacesScreenProps) {
  return (
    <div className="flex flex-col gap-6 px-5 py-6 pb-28">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Saved Places</h1>
          <p className="text-sm text-muted-foreground">
            {places.length} {places.length === 1 ? "place" : "places"} saved
          </p>
        </div>
        <Button
          onClick={onNewScan}
          size="lg"
          className="rounded-full h-12 w-12 p-0"
          aria-label="Add new place"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </header>

      {/* Places List */}
      {places.length > 0 ? (
        <section className="flex flex-col gap-3">
          {places.map((place) => {
            const entranceRoom = place.rooms.find((r) => r.isEntrance)
            return (
              <PlaceCard
                key={place.id}
                name={place.name}
                roomCount={place.rooms.length}
                mainEntrance={entranceRoom?.name}
                scanQuality={place.scanQuality}
                lastAccessed={formatLastAccessed(place.lastAccessedAt)}
                onClick={() => onOpenPlace(place.id)}
              />
            )
          })}
        </section>
      ) : (
        <EmptyState
          icon={<MapPin className="h-10 w-10" />}
          title="No saved places"
          description="Scan your first indoor space to start building your spatial library"
          actionLabel="Scan New Place"
          onAction={onNewScan}
        />
      )}
    </div>
  )
}

function formatLastAccessed(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}
