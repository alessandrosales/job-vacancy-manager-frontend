import * as React from "react"

const DEFAULT_PAGE_SIZE = 40
const DEFAULT_ROOT_MARGIN = "200px"

export type UseInfiniteScrollListOptions = {
  pageSize?: number
  rootMargin?: string
  /**
   * When you wire TanStack Query `useInfiniteQuery`, pass `isFetchingNextPage` here so the
   * sentinel does not fire duplicate requests while a page is in flight.
   */
  isFetchingNextPage?: boolean
}

export type UseInfiniteScrollListResult<T> = {
  /** Window of items rendered in the table — grows as the user scrolls. */
  visibleItems: T[]
  totalCount: number
  loadedCount: number
  hasMore: boolean
  /** Attach to the sentinel `<TableRow>` at the bottom of `<TableBody>`. */
  sentinelRef: React.RefObject<HTMLTableRowElement | null>
  /**
   * Manual load (e.g. “Load more” button). With the backend, call `fetchNextPage()` here instead
   * of relying only on the observer.
   */
  loadNextWindow: () => void
}

/**
 * Client-side infinite scroll over an in-memory array (localStorage / mock).
 *
 * **Backend (next step):** keep using `visibleItems` as “everything loaded so far” by setting
 * `items` to `data.pages.flatMap((p) => p.rows)` from `useInfiniteQuery`, and drive `hasMore` from
 * `hasNextPage`. Call your `fetchNextPage` when the sentinel intersects (or from `loadNextWindow`).
 */
export function useInfiniteScrollList<T>(
  items: readonly T[],
  options: UseInfiniteScrollListOptions = {}
): UseInfiniteScrollListResult<T> {
  const {
    pageSize = DEFAULT_PAGE_SIZE,
    rootMargin = DEFAULT_ROOT_MARGIN,
    isFetchingNextPage = false,
  } = options

  const totalCount = items.length
  const [endIndex, setEndIndex] = React.useState(() =>
    totalCount === 0 ? 0 : Math.min(pageSize, totalCount)
  )

  React.useEffect(() => {
    setEndIndex((prev) => {
      if (totalCount === 0) return 0
      if (prev === 0) return Math.min(pageSize, totalCount)
      return Math.min(prev, totalCount)
    })
  }, [totalCount, pageSize])

  const visibleItems = React.useMemo(
    () => items.slice(0, Math.min(endIndex, totalCount)),
    [items, endIndex, totalCount]
  )

  const loadedCount = visibleItems.length
  const hasMore = endIndex < totalCount

  const loadNextWindow = React.useCallback(() => {
    if (isFetchingNextPage) return
    setEndIndex((prev) => Math.min(prev + pageSize, totalCount))
  }, [isFetchingNextPage, pageSize, totalCount])

  const loadNextWindowRef = React.useRef(loadNextWindow)
  loadNextWindowRef.current = loadNextWindow

  const sentinelRef = React.useRef<HTMLTableRowElement | null>(null)

  React.useLayoutEffect(() => {
    const node = sentinelRef.current
    if (!node || !hasMore || isFetchingNextPage) return

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          loadNextWindowRef.current()
        }
      },
      { root: null, rootMargin, threshold: 0 }
    )
    obs.observe(node)
    return () => obs.disconnect()
  }, [hasMore, isFetchingNextPage, rootMargin, loadedCount])

  return {
    visibleItems,
    totalCount,
    loadedCount,
    hasMore,
    sentinelRef,
    loadNextWindow,
  }
}

export const INFINITE_LIST_PAGE_SIZE = DEFAULT_PAGE_SIZE
