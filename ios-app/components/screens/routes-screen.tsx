"use client"

import { EmptyState } from "@/components/echospace"
import { Route, ChevronRight, Clock, MapPin } from "lucide-react"
import type { Route as RouteType, Place } from "@/lib/types"
import { cn } from "@/lib/utils"

interface RoutesScreenProps {
  routes: RouteType[]
  places: Place[]
  onPracticeRoute: (routeId: string) => void
}

export function RoutesScreen({
  routes,
  places,
  onPracticeRoute,
}: RoutesScreenProps) {
  const getPlaceName = (roomId: string): string => {
    for (const place of places) {
      const room = place.rooms.find((r) => r.id === roomId)
      if (room) return room.name
    }
    return "Unknown"
  }

  return (
    <div className="flex flex-col gap-6 px-5 py-6 pb-28">
      {/* Header */}
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold">Saved Routes</h1>
        <p className="text-sm text-muted-foreground">
          Practice navigation before you go
        </p>
      </header>

      {/* Routes List */}
      {routes.length > 0 ? (
        <section className="flex flex-col gap-3">
          {routes.map((route) => (
            <button
              key={route.id}
              onClick={() => onPracticeRoute(route.id)}
              className={cn(
                "flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 text-left",
                "min-h-[120px] touch-manipulation transition-all",
                "hover:border-primary/30 hover:shadow-sm",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                "active:scale-[0.99]"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground"
                    aria-hidden="true"
                  >
                    <Route className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-lg font-semibold">{route.name}</h3>
                    <span className="text-sm text-muted-foreground">
                      {route.steps.length} steps
                    </span>
                  </div>
                </div>
                <ChevronRight
                  className="h-5 w-5 text-muted-foreground mt-1"
                  aria-hidden="true"
                />
              </div>

              <div className="flex items-center gap-4 pt-1 border-t border-border">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" aria-hidden="true" />
                  <span>
                    {getPlaceName(route.fromRoom)} to {getPlaceName(route.toRoom)}
                  </span>
                </div>
                {route.estimatedTime && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground ml-auto">
                    <Clock className="h-4 w-4" aria-hidden="true" />
                    <span>{route.estimatedTime}</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </section>
      ) : (
        <EmptyState
          icon={<Route className="h-10 w-10" />}
          title="No saved routes"
          description="Create routes within your scanned places to practice navigation"
          actionLabel="View Places"
          onAction={() => {}}
        />
      )}
    </div>
  )
}
