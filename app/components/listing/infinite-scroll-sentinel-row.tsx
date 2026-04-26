import * as React from "react"
import { Loader2Icon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { TableCell, TableRow } from "~/components/ui/table"

type InfiniteScrollSentinelRowProps = {
  colSpan: number
  sentinelRef: React.RefObject<HTMLTableRowElement | null>
  hasMore: boolean
  totalCount: number
  loadedCount: number
  loadNextWindow: () => void
}

/**
 * Last row in a listing table: intersection target for infinite scroll + optional manual load.
 */
export function InfiniteScrollSentinelRow({
  colSpan,
  sentinelRef,
  hasMore,
  totalCount,
  loadedCount,
  loadNextWindow,
}: InfiniteScrollSentinelRowProps) {
  if (totalCount === 0) return null

  return (
    <TableRow ref={sentinelRef} className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="py-4 text-center align-middle">
        {hasMore ? (
          <span className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-muted-foreground text-xs">
            <span className="inline-flex items-center gap-2">
              <Loader2Icon className="size-4 shrink-0 animate-spin" aria-hidden />
              <span>Scroll to load more ({loadedCount} / {totalCount})</span>
            </span>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={loadNextWindow}
            >
              Load more
            </Button>
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">
            End of list · {totalCount} record{totalCount === 1 ? "" : "s"}
          </span>
        )}
      </TableCell>
    </TableRow>
  )
}
