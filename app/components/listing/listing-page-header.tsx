import * as React from "react"

import { cn } from "~/lib/utils"

type ListingPageHeaderProps = {
  title: string
  description: React.ReactNode
  /** Inline controls immediately after the title (e.g. list / board toggle). */
  titleAccessory?: React.ReactNode
  /** Primary action (e.g. Add button) — rendered on the right on larger screens */
  action: React.ReactNode
  className?: string
}

/**
 * Page heading above a listing card: title (+ optional `titleAccessory`), description, and primary action.
 * Record count and quick search live in `ListingTableCard`.
 */
export function ListingPageHeader({
  title,
  description,
  titleAccessory,
  action,
  className,
}: ListingPageHeaderProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex min-w-0 flex-wrap items-center gap-2 gap-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {titleAccessory ? (
            <div className="flex shrink-0 items-center">{titleAccessory}</div>
          ) : null}
        </div>
        <div className="space-y-1.5 text-sm text-muted-foreground">
          {description}
        </div>
      </div>
      <div className="flex shrink-0 self-end sm:self-start sm:pt-0.5">
        {action}
      </div>
    </div>
  )
}
