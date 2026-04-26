import { SearchIcon } from "lucide-react"

import { Card, CardContent } from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import { cn } from "~/lib/utils"

type ListingTableCardProps = {
  children: React.ReactNode
  className?: string
  /** Shown top-left inside the card (e.g. “Showing 40 of 240”). */
  stats?: React.ReactNode
  /** Quick filter — top-right inside the card. */
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
}

/**
 * Card that fills remaining viewport height under a fixed header; toolbar row + inner grid scroll.
 */
export function ListingTableCard({
  children,
  className,
  stats,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search…",
}: ListingTableCardProps) {
  const hasStats = stats != null && stats !== ""
  const showToolbar = hasStats || onSearchChange != null

  return (
    <Card
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden py-0",
        className
      )}
    >
      <CardContent className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden px-0 pb-0 pt-0">
        {showToolbar ? (
          <div className="flex shrink-0 flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="text-muted-foreground flex min-h-5 items-center text-xs sm:text-sm">
              {stats}
            </div>
            {onSearchChange != null ? (
              <div className="relative w-full shrink-0 sm:max-w-xs">
                <SearchIcon
                  className="text-muted-foreground pointer-events-none absolute start-3 top-1/2 z-10 size-4 -translate-y-1/2"
                  aria-hidden
                />
                <Input
                  type="search"
                  value={searchValue ?? ""}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder}
                  aria-label={searchPlaceholder}
                  className="ps-9"
                />
              </div>
            ) : null}
          </div>
        ) : null}
        <div className="min-h-0 flex-1 overflow-auto px-4 pb-4 pt-4">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}
