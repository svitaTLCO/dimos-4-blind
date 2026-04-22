"use client"

import { cn } from "@/lib/utils"
import { Home, MapPin, Route, Settings } from "lucide-react"

export type TabId = "home" | "places" | "routes" | "settings"

interface TabBarProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

const tabs = [
  { id: "home" as const, label: "Home", icon: Home },
  { id: "places" as const, label: "Places", icon: MapPin },
  { id: "routes" as const, label: "Routes", icon: Route },
  { id: "settings" as const, label: "Settings", icon: Settings },
]

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav
      role="tablist"
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/80 safe-area-inset-bottom"
    >
      <div className="flex items-center justify-around px-2 pb-safe">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-label={tab.label}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-3 min-w-[64px] min-h-[56px]",
                "touch-manipulation transition-colors",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-6 w-6 transition-transform",
                  isActive && "scale-110"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn(
                  "text-xs font-medium",
                  isActive && "font-semibold"
                )}
              >
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
