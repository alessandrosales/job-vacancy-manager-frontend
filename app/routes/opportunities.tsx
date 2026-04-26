import * as React from "react"
import { Link } from "react-router"

import { InfiniteScrollSentinelRow } from "~/components/listing/infinite-scroll-sentinel-row"
import { ListingPageHeader } from "~/components/listing/listing-page-header"
import { ListingTableCard } from "~/components/listing/listing-table-card"
import { InterestLevelStarPicker } from "~/components/interest-level-star-picker"
import {
  ListingViewModeToggle,
  type ListingViewMode,
} from "~/components/listing/listing-view-mode-toggle"
import { OpportunitiesKanbanBoard } from "~/components/opportunities/opportunities-kanban-board"
import {
  useAppData,
  type Opportunity,
} from "~/components/providers/app-data-provider"
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
import {
  getColumnBadgeProps,
  getColumnTitle,
  getEffectiveColumnId,
} from "~/lib/kanban-columns"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

function filterOpportunitiesBySearch(
  rows: readonly Opportunity[],
  needle: string,
  opportunityStatuses: readonly { id: string; label: string }[],
  customColumns: readonly { id: string; title: string }[]
): Opportunity[] {
  if (!needle) return [...rows]
  const q = needle.toLowerCase()
  return rows.filter((opp) => {
    const colId = getEffectiveColumnId(opp)
    const colLabel = getColumnTitle(colId, opportunityStatuses, customColumns)
    return `${opp.company} ${opp.role} ${opp.description} ${opp.url} ${colLabel} ${opp.status} ${opp.interestLevel}`
      .toLowerCase()
      .includes(q)
  })
}

export default function OpportunitiesPage() {
  const {
    opportunities,
    deleteOpportunity,
    updateOpportunity,
    opportunityStatuses,
    kanbanCustomColumns,
    kanbanColumnOrder,
    addKanbanColumn,
    setKanbanColumnOrder,
  } = useAppData()
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [viewMode, setViewMode] = React.useState<ListingViewMode>("list")
  const [searchQuery, setSearchQuery] = React.useState("")
  const searchNeedle = searchQuery.trim()

  const filteredOpportunities = React.useMemo(
    () =>
      filterOpportunitiesBySearch(
        opportunities,
        searchNeedle,
        opportunityStatuses,
        kanbanCustomColumns
      ),
    [opportunities, searchNeedle, opportunityStatuses, kanbanCustomColumns]
  )

  const {
    visibleItems,
    totalCount,
    loadedCount,
    hasMore,
    sentinelRef,
    loadNextWindow,
  } = useInfiniteScrollList(filteredOpportunities, {
    filterKey: searchNeedle,
  })

  return (
    <AppLayout title="Opportunities">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <ListingPageHeader
          title="Opportunities"
          description="All tracked job opportunities"
          titleAccessory={
            <ListingViewModeToggle
              value={viewMode}
              onValueChange={setViewMode}
              groupLabel="Opportunity view"
              listLabel="List view"
              kanbanLabel="Kanban board"
            />
          }
          action={
            <Button asChild>
              <Link to="/opportunities/opportunity">
                <PlusIcon data-icon="inline-start" />
                Add opportunity
              </Link>
            </Button>
          }
        />
        <ListingTableCard
          stats={
            viewMode === "list" && totalCount > 0
              ? `Showing ${loadedCount} of ${totalCount}`
              : viewMode === "kanban" && filteredOpportunities.length > 0
                ? `${filteredOpportunities.length} opportunit${filteredOpportunities.length === 1 ? "y" : "ies"}`
                : undefined
          }
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search opportunities…"
        >
          {viewMode === "kanban" ? (
            opportunities.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No opportunities yet. Add one to get started.
              </p>
            ) : filteredOpportunities.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No matches for your search.
              </p>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col">
                <OpportunitiesKanbanBoard
                  opportunities={filteredOpportunities}
                  customColumns={kanbanCustomColumns}
                  opportunityStatuses={opportunityStatuses}
                  columnOrder={kanbanColumnOrder}
                  onColumnOrderChange={setKanbanColumnOrder}
                  onAddColumn={addKanbanColumn}
                  updateOpportunity={updateOpportunity}
                  onRequestDelete={setDeleteId}
                />
              </div>
            )
          ) : (
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Actions</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Interest</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground">
                    No opportunities yet. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : filteredOpportunities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground">
                    No matches for your search.
                  </TableCell>
                </TableRow>
              ) : (
                visibleItems.map((opp) => {
                  const s = getColumnBadgeProps(
                    getEffectiveColumnId(opp),
                    opportunityStatuses,
                    kanbanCustomColumns
                  )
                  return (
                    <TableRow key={opp.id}>
                      <TableCell>
                        <div className="flex justify-start gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link
                              to={`/opportunities/opportunity/${encodeURIComponent(opp.id)}`}
                              aria-label="Edit opportunity"
                            >
                              <PencilIcon />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete opportunity"
                            onClick={() => setDeleteId(opp.id)}
                          >
                            <Trash2Icon />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{opp.company}</TableCell>
                      <TableCell>{opp.role}</TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {opp.description}
                      </TableCell>
                      <TableCell>
                        <a
                          href={opp.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          Link
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <InterestLevelStarPicker
                          value={opp.interestLevel}
                          size="sm"
                          showValueLabel={false}
                          onChange={(nextLevel) =>
                            updateOpportunity(opp.id, {
                              company: opp.company,
                              role: opp.role,
                              description: opp.description,
                              url: opp.url,
                              status: opp.status,
                              interestLevel: nextLevel,
                              boardColumnId: opp.boardColumnId ?? opp.status,
                            })
                          }
                        />
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
              <InfiniteScrollSentinelRow
                colSpan={7}
                sentinelRef={sentinelRef}
                hasMore={hasMore}
                totalCount={totalCount}
                loadedCount={loadedCount}
                loadNextWindow={loadNextWindow}
              />
            </TableBody>
          </Table>
          )}
        </ListingTableCard>

        <AlertDialog
          open={deleteId !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteId(null)
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete opportunity?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes the opportunity from your list. You can add it
                again later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  if (deleteId) deleteOpportunity(deleteId)
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
