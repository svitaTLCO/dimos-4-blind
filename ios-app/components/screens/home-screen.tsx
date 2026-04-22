"use client"

import { ActionCard, PlaceCard } from "@/components/echospace"
import { Plus, MapPin, Route, Settings, Scan } from "lucide-react"
import type { Place, Route as RouteType } from "@/lib/types"

interface HomeScreenProps {
  places: Place[]
  recentRoutes: RouteType[]
  onNewScan: () => void
  onOpenPlace: (placeId: string) => void
  onPracticeRoute: (routeId: string) => void
  onOpenSettings: () => void
}

export function HomeScreen({
  places,
  recentRoutes,
  onNewScan,
  onOpenPlace,
  onPracticeRoute,
  onOpenSettings,
}: HomeScreenProps) {
  const recentPlace = places[0]
  const hasUnfinishedScan = places.some(
    (p) => p.rooms.some((r) => !r.scanComplete)
  )
  const unfinishedPlace = places.find((p) =>
    p.rooms.some((r) => !r.scanComplete)
  )

  return (
    <div className="flex flex-col gap-6 px-5 py-6 pb-28">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">EchoSpace</h1>
        <p className="text-base text-muted-foreground">
          Learn spaces before you enter
        </p>
      </header>

      {/* Primary Actions */}
      <section aria-labelledby="actions-heading" className="flex flex-col gap-3">
        <h2 id="actions-heading" className="sr-only">
          Quick Actions
        </h2>

        {hasUnfinishedScan && unfinishedPlace && (
          <ActionCard
            title="Continue Scan"
            description={`Finish scanning ${unfinishedPlace.name}`}
            icon={<Scan className="h-6 w-6" />}
            onClick={onNewScan}
            variant="primary"
            badge="In Progress"
          />
        )}

        <ActionCard
          title="New Place"
          description="Scan a new indoor environment"
          icon={<Plus className="h-6 w-6" />}
          onClick={onNewScan}
          variant={hasUnfinishedScan ? "default" : "primary"}
          size="large"
        />

        {recentPlace && (
          <ActionCard
            title="Open Recent"
            description={recentPlace.name}
            icon={<MapPin className="h-6 w-6" />}
            onClick={() => onOpenPlace(recentPlace.id)}
          />
        )}

        {recentRoutes.length > 0 && (
          <ActionCard
            title="Practice Route"
            description={recentRoutes[0].name}
            icon={<Route className="h-6 w-6" />}
            onClick={() => onPracticeRoute(recentRoutes[0].id)}
          />
        )}
      </section>

      {/* Saved Places */}
      {places.length > 0 && (
        <section aria-labelledby="places-heading" className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2
              id="places-heading"
              className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Your Places
            </h2>
            <span className="text-sm text-muted-foreground">
              {places.length} {places.length === 1 ? "place" : "places"}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {places.slice(0, 3).map((place) => {
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
          </div>
        </section>
      )}

      {/* Quick Settings Access */}
      <section aria-labelledby="settings-heading">
        <h2 id="settings-heading" className="sr-only">
          Accessibility
        </h2>
        <ActionCard
          title="Accessibility"
          description="Voice, contrast, and motion settings"
          icon={<Settings className="h-6 w-6" />}
          onClick={onOpenSettings}
          variant="muted"
        />
      </section>
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
