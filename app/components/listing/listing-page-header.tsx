import * as React from "react"

import { cn } from "~/lib/utils"

type ListingPageHeaderProps = {
  title: string
  description: string
  /** e.g. “Showing 40 of 240” */
  stats?: React.ReactNode
  /** Primary action (e.g. Add button) — rendered on the right on larger screens */
  action: React.ReactNode
  className?: string
}

/**
 * Page heading above a listing card: title stack on the left, action on the right.
 */
export function ListingPageHeader({
  title,
  description,
  stats,
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
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">{description}</p>
        {stats ? (
          <p className="text-xs text-muted-foreground">{stats}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 self-end sm:self-start sm:pt-0.5">{action}</div>
    </div>
  )
}
