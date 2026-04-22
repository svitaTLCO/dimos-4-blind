"use client"

import { cn } from "@/lib/utils"

interface ActionCardProps {
  title: string
  description?: string
  icon: React.ReactNode
  onClick?: () => void
  variant?: "default" | "primary" | "muted"
  size?: "default" | "large"
  badge?: string
  disabled?: boolean
  className?: string
}

export function ActionCard({
  title,
  description,
  icon,
  onClick,
  variant = "default",
  size = "default",
  badge,
  disabled = false,
  className,
}: ActionCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={description ? `${title}. ${description}` : title}
      className={cn(
        "relative flex w-full items-start gap-4 rounded-2xl p-5 text-left transition-all",
        "min-h-[88px] touch-manipulation",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
        "active:scale-[0.98]",
        variant === "default" && "bg-card border border-border hover:bg-accent/50",
        variant === "primary" && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === "muted" && "bg-muted text-muted-foreground hover:bg-muted/80",
        size === "large" && "p-6 min-h-[120px]",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <div
        className={cn(
          "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
          variant === "default" && "bg-secondary text-secondary-foreground",
          variant === "primary" && "bg-primary-foreground/20 text-primary-foreground",
          variant === "muted" && "bg-background text-muted-foreground"
        )}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="flex flex-col gap-1 min-w-0">
        <span
          className={cn(
            "text-lg font-semibold leading-tight",
            size === "large" && "text-xl"
          )}
        >
          {title}
        </span>
        {description && (
          <span
            className={cn(
              "text-sm leading-relaxed",
              variant === "default" && "text-muted-foreground",
              variant === "primary" && "text-primary-foreground/80"
            )}
          >
            {description}
          </span>
        )}
      </div>
      {badge && (
        <span
          className={cn(
            "absolute top-4 right-4 rounded-full px-2.5 py-0.5 text-xs font-medium",
            variant === "default" && "bg-primary/10 text-primary",
            variant === "primary" && "bg-primary-foreground/20 text-primary-foreground"
          )}
        >
          {badge}
        </span>
      )}
    </button>
  )
}
