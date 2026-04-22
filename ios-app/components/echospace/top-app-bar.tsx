"use client"

import { cn } from "@/lib/utils"
import { ChevronLeft, X } from "lucide-react"

interface TopAppBarProps {
  title: string
  subtitle?: string
  showBack?: boolean
  showClose?: boolean
  onBack?: () => void
  onClose?: () => void
  rightAction?: React.ReactNode
  variant?: "default" | "transparent" | "blur"
  className?: string
}

export function TopAppBar({
  title,
  subtitle,
  showBack = false,
  showClose = false,
  onBack,
  onClose,
  rightAction,
  variant = "default",
  className,
}: TopAppBarProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex items-center justify-between px-4 py-3 min-h-[60px] safe-area-inset-top",
        variant === "default" && "bg-background border-b border-border",
        variant === "transparent" && "bg-transparent",
        variant === "blur" &&
          "bg-background/80 backdrop-blur-lg border-b border-border/50",
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-[44px]">
        {showBack && (
          <button
            onClick={onBack}
            aria-label="Go back"
            className="flex h-11 w-11 items-center justify-center rounded-full -ml-2 touch-manipulation hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        {showClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 items-center justify-center rounded-full -ml-2 touch-manipulation hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      <div className="flex flex-col items-center text-center flex-1 min-w-0 px-2">
        <h1 className="text-lg font-semibold truncate max-w-full">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground truncate max-w-full">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 min-w-[44px] justify-end">
        {rightAction}
      </div>
    </header>
  )
}
