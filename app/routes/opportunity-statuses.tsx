import * as React from "react"
import { Link } from "react-router"

import { InfiniteScrollSentinelRow } from "~/components/listing/infinite-scroll-sentinel-row"
import { ListingPageHeader } from "~/components/listing/listing-page-header"
import { ListingTableCard } from "~/components/listing/listing-table-card"
import { AppLayout } from "~/components/layout/app-layout"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog"
import { useInfiniteScrollList } from "~/hooks/use-infinite-scroll-list"
import { ApiError } from "~/lib/api/errors"
import {
  deleteOpportunityStatus as deleteOpportunityStatusRequest,
  listOpportunityStatuses,
  updateOpportunityStatus,
  type ApiOpportunityStatus,
} from "~/lib/api/resources/opportunity-statuses"
import type { StatusBadgeVariant } from "~/lib/labels"
import { ChevronDownIcon, ChevronUpIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

function filterBySearch(rows: readonly ApiOpportunityStatus[], needle: string): ApiOpportunityStatus[] {
  if (!needle) return [...rows]
  const q = needle.toLowerCase()
  return rows.filter(
    (r) =>
      r.label.toLowerCase().includes(q) ||
      r.variant.toLowerCase().includes(q) ||
      (r.description ?? "").toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q)
  )
}

function apiErrorText(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const base = err.fieldErrors.base?.[0]
    if (base) return base
    const firstField = Object.values(err.fieldErrors).flat()[0]
    if (firstField) return firstField
  }
  return fallback
}

export default function OpportunityStatusesPage() {
  const [statuses, setStatuses] = React.useState<ApiOpportunityStatus[]>([])
  const [loadState, setLoadState] = React.useState<"idle" | "loading" | "error">(
    "loading"
  )
  const [listError, setListError] = React.useState<string | null>(null)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)
  const [reorderBusy, setReorderBusy] = React.useState(false)
  const [reorderError, setReorderError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const searchNeedle = searchQuery.trim()

  const sortedAll = React.useMemo(
    () =>
      [...statuses].sort(
        (a, b) => (a.position ?? 0) - (b.position ?? 0)
      ),
    [statuses]
  )

  const fetchStatuses = React.useCallback(async () => {
    setLoadState("loading")
    setListError(null)
    try {
      const data = await listOpportunityStatuses({ paginated: false })
      setStatuses(data)
      setLoadState("idle")
    } catch (e) {
      setLoadState("error")
      setListError(apiErrorText(e, "Could not load statuses."))
    }
  }, [])

  React.useEffect(() => {
    void fetchStatuses()
  }, [fetchStatuses])

  const filtered = React.useMemo(
    () => filterBySearch(statuses, searchNeedle),
    [statuses, searchNeedle]
  )

  const {
    visibleItems,
    totalCount,
    loadedCount,
    hasMore,
    sentinelRef,
    loadNextWindow,
  } = useInfiniteScrollList(filtered, { filterKey: searchNeedle })

  async function moveId(id: string, direction: "up" | "down") {
    const list = sortedAll
    const i = list.findIndex((s) => s.id === id)
    if (i < 0) return
    const j = direction === "up" ? i - 1 : i + 1
    if (j < 0 || j >= list.length) return
    const a = list[i]!
    const b = list[j]!
    const posA = a.position ?? 0
    const posB = b.position ?? 0

    setReorderError(null)
    setReorderBusy(true)
    try {
      await Promise.all([
        updateOpportunityStatus(a.id, { position: posB }),
        updateOpportunityStatus(b.id, { position: posA }),
      ])
      await fetchStatuses()
    } catch (e) {
      setReorderError(apiErrorText(e, "Could not reorder statuses."))
    } finally {
      setReorderBusy(false)
    }
  }

  async function confirmDelete() {
    if (!deleteId) return
    setDeleteSubmitting(true)
    setDeleteError(null)
    try {
      await deleteOpportunityStatusRequest(deleteId)
      setStatuses((prev) => prev.filter((s) => s.id !== deleteId))
      setDeleteId(null)
    } catch (e) {
      setDeleteError(apiErrorText(e, "Could not delete status."))
    } finally {
      setDeleteSubmitting(false)
    }
  }

  return (
    <AppLayout title="Opportunity statuses">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <ListingPageHeader
          title="Opportunity statuses"
          description="Configure pipeline stages — each status appears as a column on the Kanban board"
          action={
            <Button asChild>
              <Link to="/opportunities/status">
                <PlusIcon data-icon="inline-start" />
                Add status
              </Link>
            </Button>
          }
        />
        {reorderError ? (
          <p className="text-sm text-destructive" role="alert">
            {reorderError}
          </p>
        ) : null}
        <ListingTableCard
          stats={
            loadState === "idle" && totalCount > 0
              ? `Showing ${loadedCount} of ${totalCount}`
              : undefined
          }
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search statuses…"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Actions</TableHead>
                <TableHead className="w-24">Order</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-40">Style</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadState === "loading" ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    Loading statuses…
                  </TableCell>
                </TableRow>
              ) : loadState === "error" ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-destructive">{listError}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void fetchStatuses()}
                      >
                        Try again
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : statuses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No statuses. Add your first stage.
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No matches for your search.
                  </TableCell>
                </TableRow>
              ) : (
                visibleItems.map((st) => {
                  const pos = sortedAll.findIndex((s) => s.id === st.id)
                  const isFirst = pos <= 0
                  const isLast = pos < 0 || pos >= sortedAll.length - 1
                  return (
                    <TableRow key={st.id}>
                      <TableCell>
                        <div className="flex justify-start gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link
                              to={`/opportunities/status/${encodeURIComponent(st.id)}`}
                              aria-label="Edit status"
                            >
                              <PencilIcon />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete status"
                            onClick={() => {
                              setDeleteError(null)
                              setDeleteId(st.id)
                            }}
                            disabled={statuses.length <= 1}
                          >
                            <Trash2Icon />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="inline-flex items-center gap-0.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label="Move up"
                            disabled={isFirst || reorderBusy}
                            onClick={() => void moveId(st.id, "up")}
                          >
                            <ChevronUpIcon />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label="Move down"
                            disabled={isLast || reorderBusy}
                            onClick={() => void moveId(st.id, "down")}
                          >
                            <ChevronDownIcon />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{st.label}</TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {st.description ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={st.variant as StatusBadgeVariant}>
                          {st.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
              {loadState === "idle" && statuses.length > 0 ? (
                <InfiniteScrollSentinelRow
                  colSpan={5}
                  sentinelRef={sentinelRef}
                  hasMore={hasMore}
                  totalCount={totalCount}
                  loadedCount={loadedCount}
                  loadNextWindow={loadNextWindow}
                />
              ) : null}
            </TableBody>
          </Table>
        </ListingTableCard>

        <AlertDialog
          open={deleteId !== null}
          onOpenChange={(open) => {
            if (!open) {
              setDeleteId(null)
              setDeleteError(null)
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this status?</AlertDialogTitle>
              <AlertDialogDescription>
                Opportunities in this column move to another status. Custom Kanban
                columns are not removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteError ? (
              <p className="text-sm text-destructive" role="alert">
                {deleteError}
              </p>
            ) : null}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteSubmitting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={deleteSubmitting}
                onClick={(e) => {
                  e.preventDefault()
                  void confirmDelete()
                }}
              >
                {deleteSubmitting ? "Deleting…" : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  )
}
