import * as React from "react"
import { Link } from "react-router"

import { InfiniteScrollSentinelRow } from "~/components/listing/infinite-scroll-sentinel-row"
import { ListingPageHeader } from "~/components/listing/listing-page-header"
import { ListingTableCard } from "~/components/listing/listing-table-card"
import { useAppData } from "~/components/providers/app-data-provider"
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
import { ChevronDownIcon, ChevronUpIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

function filterBySearch(
  rows: readonly { id: string; label: string; variant: string }[],
  needle: string
) {
  if (!needle) return [...rows]
  const q = needle.toLowerCase()
  return rows.filter(
    (r) =>
      r.label.toLowerCase().includes(q) ||
      r.variant.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q)
  )
}

export default function OpportunityStatusesPage() {
  const {
    opportunity_statuses: opportunityStatuses,
    deleteOpportunityStatus,
    reorderOpportunityStatuses,
  } = useAppData()
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const searchNeedle = searchQuery.trim()

  const filtered = React.useMemo(
    () => filterBySearch(opportunityStatuses, searchNeedle),
    [opportunityStatuses, searchNeedle]
  )

  const {
    visibleItems,
    totalCount,
    loadedCount,
    hasMore,
    sentinelRef,
    loadNextWindow,
  } = useInfiniteScrollList(filtered, { filterKey: searchNeedle })

  function moveId(id: string, direction: "up" | "down") {
    const list = opportunityStatuses.map((s) => s.id)
    const i = list.indexOf(id)
    if (i < 0) return
    const j = direction === "up" ? i - 1 : i + 1
    if (j < 0 || j >= list.length) return
    const next = list.slice()
    const t = next[i]!
    next[i] = next[j]!
    next[j] = t
    reorderOpportunityStatuses(next)
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
        <ListingTableCard
          stats={
            totalCount > 0
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
              {opportunityStatuses.length === 0 ? (
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
                  const allIds = opportunityStatuses.map((s) => s.id)
                  const pos = allIds.indexOf(st.id)
                  const isFirst = pos <= 0
                  const isLast = pos < 0 || pos >= allIds.length - 1
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
                            onClick={() => setDeleteId(st.id)}
                            disabled={opportunityStatuses.length <= 1}
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
                            disabled={isFirst}
                            onClick={() => moveId(st.id, "up")}
                          >
                            <ChevronUpIcon />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-label="Move down"
                            disabled={isLast}
                            onClick={() => moveId(st.id, "down")}
                          >
                            <ChevronDownIcon />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{st.label}</TableCell>
                      <TableCell className="text-muted-foreground max-w-xs truncate">
                        {st.description ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
              <InfiniteScrollSentinelRow
                colSpan={5}
                sentinelRef={sentinelRef}
                hasMore={hasMore}
                totalCount={totalCount}
                loadedCount={loadedCount}
                loadNextWindow={loadNextWindow}
              />
            </TableBody>
          </Table>
        </ListingTableCard>

        <AlertDialog
          open={deleteId !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteId(null)
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
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  if (deleteId) deleteOpportunityStatus(deleteId)
                  setDeleteId(null)
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  )
}
