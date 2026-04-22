"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-8 py-16 text-center",
        className
      )}
    >
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="flex flex-col gap-2 max-w-xs">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="text-base text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          size="lg"
          className="mt-2 min-h-[48px] px-6 rounded-full"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
