import * as React from "react"
import { Link } from "react-router"

import { OpportunityDialog } from "~/components/opportunities/opportunity-dialog"
import { QuickAddOpportunityStatusDialog } from "~/components/opportunities/quick-add/quick-add-opportunity-status-dialog"
import { InfiniteScrollSentinelRow } from "~/components/listing/infinite-scroll-sentinel-row"
import { ListingPageHeader } from "~/components/listing/listing-page-header"
import { ListingTableCard } from "~/components/listing/listing-table-card"
import { InterestLevelStarPicker } from "~/components/shared/interest-level-star-picker"
import {
  ListingViewModeToggle,
  type ListingViewMode,
} from "~/components/listing/listing-view-mode-toggle"
import { OpportunitiesKanbanBoard } from "~/components/opportunities/opportunities-kanban-board"
import {
  useAppData,
  type Company,
  type Opportunity,
  type Role,
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
import { ApiError } from "~/lib/api/errors"
import {
  apiCompanyToCompany,
  apiOpportunityStatusToDefinition,
  apiOpportunityToOpportunity,
  apiRoleToRole,
  opportunityFormToApiWrite,
} from "~/lib/opportunity-api-mappers"
import {
  getEffectiveColumnId,
  getColumnBadgeProps,
  getColumnTitle,
  sortOpportunitiesByUpdatedAtDesc,
} from "~/lib/kanban-columns"
import {
  formatOpportunityAnnualSalary,
  formatOpportunityHourlyRate,
  opportunityCompanyName,
  opportunityRoleName,
  opportunitySearchBlob,
} from "~/lib/opportunity-display"
import { listCompanies } from "~/lib/api/resources/companies"
import {
  deleteOpportunity as deleteOpportunityApi,
  listOpportunities,
  updateOpportunity as updateOpportunityApi,
  type ApiOpportunityWrite,
} from "~/lib/api/resources/opportunities"
import { listOpportunityStatuses } from "~/lib/api/resources/opportunity-statuses"
import { listRoles } from "~/lib/api/resources/roles"
import type { InterestLevel, OpportunityStatusDefinition } from "~/lib/labels"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

function filterOpportunitiesBySearch(
  rows: readonly Opportunity[],
  needle: string,
  opportunityStatuses: readonly OpportunityStatusDefinition[],
  customColumns: readonly { id: string; title: string }[],
  companies: readonly Company[],
  roles: readonly Role[]
): Opportunity[] {
  if (!needle) return [...rows]
  const q = needle.toLowerCase()
  return rows.filter((opp) => {
    const colId = getEffectiveColumnId(opp)
    const colLabel = getColumnTitle(colId, opportunityStatuses, customColumns)
    const blob = opportunitySearchBlob(
      opp,
      companies,
      roles,
      `${opp.description} ${opp.url} ${colLabel} ${opp.status} ${opp.interest_level}`
    )
    return blob.toLowerCase().includes(q)
  })
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

export default function OpportunitiesPage() {
  const {
    kanban_custom_columns: kanbanCustomColumns,
    kanban_column_order: kanbanColumnOrder,
    addKanbanColumn,
    setKanbanColumnOrder,
  } = useAppData()

  const [opportunities, setOpportunities] = React.useState<Opportunity[]>([])
  const [companies, setCompanies] = React.useState<Company[]>([])
  const [roles, setRoles] = React.useState<Role[]>([])
  const [opportunityStatuses, setOpportunityStatuses] = React.useState<
    OpportunityStatusDefinition[]
  >([])

  const [loadState, setLoadState] = React.useState<"idle" | "loading" | "error">(
    "loading"
  )
  const [listError, setListError] = React.useState<string | null>(null)

  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)

  const [dialogOppId, setDialogOppId] = React.useState<string | null>(null)
  const [statusQuickAddOpen, setStatusQuickAddOpen] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<ListingViewMode>("list")
  const [searchQuery, setSearchQuery] = React.useState("")
  const searchNeedle = searchQuery.trim()

  const [interestPatchError, setInterestPatchError] = React.useState<string | null>(
    null
  )

  const referenceLists = React.useMemo(
    () => ({
      companies,
      roles,
      opportunityStatuses,
    }),
    [companies, roles, opportunityStatuses]
  )

  const fetchAll = React.useCallback(async () => {
    setLoadState("loading")
    setListError(null)
    try {
      const [opps, co, ro, st] = await Promise.all([
        listOpportunities({ paginated: false }),
        listCompanies({ paginated: false }),
        listRoles({ paginated: false }),
        listOpportunityStatuses({ paginated: false }),
      ])
      setOpportunities(opps.map(apiOpportunityToOpportunity))
      setCompanies(co.map(apiCompanyToCompany))
      setRoles(ro.map(apiRoleToRole))
      setOpportunityStatuses(st.map(apiOpportunityStatusToDefinition))
      setLoadState("idle")
    } catch (e) {
      setLoadState("error")
      setListError(apiErrorText(e, "Could not load opportunities."))
    }
  }, [])

  React.useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  const filteredOpportunities = React.useMemo(
    () =>
      sortOpportunitiesByUpdatedAtDesc(
        filterOpportunitiesBySearch(
          opportunities,
          searchNeedle,
          opportunityStatuses,
          kanbanCustomColumns,
          companies,
          roles
        )
      ),
    [
      opportunities,
      searchNeedle,
      opportunityStatuses,
      kanbanCustomColumns,
      companies,
      roles,
    ]
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

  const patchOpportunityOnServer = React.useCallback(
    async (id: string, patch: Partial<ApiOpportunityWrite>) => {
      const optimisticTs = new Date().toISOString()
      setOpportunities((prev) =>
        prev.map((o) =>
          o.id === id ? { ...o, updated_at: optimisticTs } : o
        )
      )
      const updated = await updateOpportunityApi(id, patch)
      const next = apiOpportunityToOpportunity(updated)
      setOpportunities((prev) => prev.map((o) => (o.id === id ? next : o)))
    },
    []
  )

  const handleKanbanUpdate = React.useCallback(
    (oppId: string, row: Omit<Opportunity, "id">) => {
      const targetCol = row.board_column_id ?? row.status
      const isStatusColumn = opportunityStatuses.some((s) => s.id === targetCol)

      if (isStatusColumn) {
        void (async () => {
          try {
            await patchOpportunityOnServer(
              oppId,
              opportunityFormToApiWrite({
                company_id: row.company_id,
                role_id: row.role_id,
                status_id: targetCol,
                description: row.description,
                url: row.url,
                interest_level: row.interest_level,
                hourly_rate: row.hourly_rate,
                annual_salary: row.annual_salary,
              })
            )
          } catch {
            void fetchAll()
          }
        })()
      } else {
        const touchedAt = new Date().toISOString()
        setOpportunities((prev) =>
          prev.map((o) =>
            o.id === oppId ? { ...o, ...row, updated_at: touchedAt } : o
          )
        )
      }
    },
    [opportunityStatuses, patchOpportunityOnServer, fetchAll]
  )

  async function confirmDelete() {
    if (!deleteId) return
    setDeleteSubmitting(true)
    setDeleteError(null)
    try {
      await deleteOpportunityApi(deleteId)
      setOpportunities((prev) => prev.filter((o) => o.id !== deleteId))
      setDeleteId(null)
    } catch (e) {
      setDeleteError(apiErrorText(e, "Could not delete opportunity."))
    } finally {
      setDeleteSubmitting(false)
    }
  }

  async function patchInterestLevel(opp: Opportunity, nextLevel: InterestLevel) {
    setInterestPatchError(null)
    try {
      await patchOpportunityOnServer(opp.id, { interest_level: nextLevel })
    } catch (e) {
      setInterestPatchError(apiErrorText(e, "Could not update interest."))
    }
  }

  return (
    <AppLayout title="Opportunities">
      <OpportunityDialog
        key={dialogOppId ?? "closed"}
        open={dialogOppId !== null}
        onOpenChange={(open) => {
          if (!open) setDialogOppId(null)
        }}
        opportunityId={dialogOppId}
        referenceLists={referenceLists}
        onSaved={() => void fetchAll()}
        onReferenceListsRefresh={() => void fetchAll()}
      />
      <QuickAddOpportunityStatusDialog
        open={statusQuickAddOpen}
        onOpenChange={setStatusQuickAddOpen}
        onAdded={() => {}}
        persistViaApi
        onPersistedViaApi={() => void fetchAll()}
      />
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

        {loadState === "error" ? (
          <p className="text-destructive px-1 text-sm" role="alert">
            {listError ?? "Could not load data."}{" "}
            <Button
              type="button"
              variant="link"
              className="text-destructive h-auto p-0 align-baseline underline"
              onClick={() => void fetchAll()}
            >
              Retry
            </Button>
          </p>
        ) : null}

        <ListingTableCard
          stats={
            loadState === "idle" && viewMode === "list" && totalCount > 0
              ? `Showing ${loadedCount} of ${totalCount}`
              : loadState === "idle" &&
                  viewMode === "kanban" &&
                  filteredOpportunities.length > 0
                ? `${filteredOpportunities.length} opportunit${filteredOpportunities.length === 1 ? "y" : "ies"}`
                : undefined
          }
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search opportunities…"
        >
          {loadState === "loading" ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Loading opportunities…
            </p>
          ) : viewMode === "kanban" ? (
            opportunityStatuses.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <p className="text-muted-foreground max-w-md text-sm">
                  No opportunity statuses yet. Create a status to add Kanban columns
                  (pipeline stages). You can also add one from an opportunity form
                  (Opportunity status → +).
                </p>
                <Button
                  type="button"
                  onClick={() => setStatusQuickAddOpen(true)}
                >
                  <PlusIcon data-icon="inline-start" />
                  New opportunity status
                </Button>
              </div>
            ) : opportunities.length === 0 ? (
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
                  updateOpportunity={handleKanbanUpdate}
                  onRequestDelete={setDeleteId}
                  onOpportunityDoubleClick={(oppId: string) => setDialogOppId(oppId)}
                  statusColumnsOnly
                  companies={companies}
                  roles={roles}
                  onOpportunityStatusesRefresh={() => void fetchAll()}
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
                  <TableHead>Hourly rate</TableHead>
                  <TableHead>Annual salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Interest</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interestPatchError ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-destructive text-sm">
                      {interestPatchError}
                    </TableCell>
                  </TableRow>
                ) : null}
                {opportunities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-muted-foreground">
                      No opportunities yet. Add one to get started.
                    </TableCell>
                  </TableRow>
                ) : filteredOpportunities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-muted-foreground">
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
                      <TableRow
                        key={opp.id}
                        className="cursor-pointer"
                        onClick={() => setDialogOppId(opp.id)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
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
                        <TableCell className="font-medium">
                          {opportunityCompanyName(opp, companies)}
                        </TableCell>
                        <TableCell>{opportunityRoleName(opp, roles)}</TableCell>
                        <TableCell className="max-w-xs truncate text-muted-foreground">
                          {opp.description}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          {opp.url.trim() !== "" ? (
                            <a
                              href={opp.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary underline-offset-4 hover:underline"
                            >
                              Link
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                          {formatOpportunityHourlyRate(opp.hourly_rate)}
                        </TableCell>
                        <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                          {formatOpportunityAnnualSalary(opp.annual_salary)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={s.variant}>{s.label}</Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <InterestLevelStarPicker
                            value={
                              Math.min(
                                5,
                                Math.max(0, Math.round(opp.interest_level))
                              ) as InterestLevel
                            }
                            size="sm"
                            showValueLabel={false}
                            onChange={(nextLevel) => void patchInterestLevel(opp, nextLevel)}
                          />
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
                <InfiniteScrollSentinelRow
                  colSpan={9}
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
                This removes the opportunity from your list. You can add it again
                later.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteError ? (
              <p className="text-destructive text-sm" role="alert">
                {deleteError}
              </p>
            ) : null}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteSubmitting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={deleteSubmitting}
                onClick={(ev) => {
                  ev.preventDefault()
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
