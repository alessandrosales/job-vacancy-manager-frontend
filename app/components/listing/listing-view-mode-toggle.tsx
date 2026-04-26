import * as React from "react"
import { LayoutGridIcon, LayoutListIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { cn } from "~/lib/utils"

export type ListingViewMode = "list" | "kanban"

type ListingViewModeToggleProps = {
  value: ListingViewMode
  onValueChange: (mode: ListingViewMode) => void
  /** e.g. “Opportunity view” */
  groupLabel: string
  listLabel: string
  kanbanLabel: string
  className?: string
}

/**
 * Compact icon toggle for list vs board (e.g. Kanban) — sits beside the page title.
 */
export function ListingViewModeToggle({
  value,
  onValueChange,
  groupLabel,
  listLabel,
  kanbanLabel,
  className,
}: ListingViewModeToggleProps) {
  return (
    <div
      role="group"
      aria-label={groupLabel}
      className={cn(
        "inline-flex shrink-0 items-center rounded-lg border border-border bg-muted/40 p-0.5",
        className
      )}
    >
      <Button
        type="button"
        size="icon"
        variant={value === "list" ? "secondary" : "ghost"}
        className="size-8 rounded-md"
        aria-pressed={value === "list"}
        aria-label={listLabel}
        onClick={() => onValueChange("list")}
      >
        <LayoutListIcon />
      </Button>
      <Button
        type="button"
        size="icon"
        variant={value === "kanban" ? "secondary" : "ghost"}
        className="size-8 rounded-md"
        aria-pressed={value === "kanban"}
        aria-label={kanbanLabel}
        onClick={() => onValueChange("kanban")}
      >
        <LayoutGridIcon />
      </Button>
    </div>
  )
}
