"use client"

import { cn } from "@/lib/utils"

interface ListSectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function ListSection({
  title,
  description,
  children,
  className,
}: ListSectionProps) {
  return (
    <section
      className={cn("flex flex-col gap-3", className)}
      aria-labelledby={title ? `section-${title.toLowerCase().replace(/\s/g, "-")}` : undefined}
    >
      {(title || description) && (
        <div className="flex flex-col gap-0.5 px-1">
          {title && (
            <h2
              id={`section-${title.toLowerCase().replace(/\s/g, "-")}`}
              className="text-sm font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {title}
            </h2>
          )}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="flex flex-col gap-2 rounded-2xl bg-card border border-border overflow-hidden">
        {children}
      </div>
    </section>
  )
}
