"use client"

import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"

interface AccessibilityToggleProps {
  id: string
  label: string
  description?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  icon?: React.ReactNode
  className?: string
}

export function AccessibilityToggle({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  icon,
  className,
}: AccessibilityToggleProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-xl px-4 py-4",
        "min-h-[64px] bg-card border border-border",
        className
      )}
    >
      {icon && (
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <label
          htmlFor={id}
          className="text-base font-medium cursor-pointer"
        >
          {label}
        </label>
        {description && (
          <span className="text-sm text-muted-foreground">{description}</span>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="shrink-0"
      />
    </div>
  )
}
