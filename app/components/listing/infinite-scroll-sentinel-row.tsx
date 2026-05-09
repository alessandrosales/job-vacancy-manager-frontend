"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Loader2Icon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { TableCell, TableRow } from "~/components/ui/table"
import { pagesI18nNs } from "~/lib/i18n/config"

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
  const { t } = useTranslation(pagesI18nNs)

  if (totalCount === 0) return null

  return (
    <TableRow ref={sentinelRef} className="hover:bg-transparent">
      <TableCell colSpan={colSpan} className="py-4 text-center align-middle">
        {hasMore ? (
          <span className="inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-muted-foreground text-xs">
            <span className="inline-flex items-center gap-2">
              <Loader2Icon className="size-4 shrink-0 animate-spin" aria-hidden />
              <span>
                {t("infinite_scroll.scroll_hint", {
                  loaded: loadedCount,
                  total: totalCount,
                })}
              </span>
            </span>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={loadNextWindow}
            >
              {t("infinite_scroll.load_more")}
            </Button>
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">
            {totalCount === 1
              ? t("infinite_scroll.end_of_list_one", { count: totalCount })
              : t("infinite_scroll.end_of_list_other", { count: totalCount })}
          </span>
        )}
      </TableCell>
    </TableRow>
  )
}
