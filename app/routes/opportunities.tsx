"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
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
import { useSessionUserStore } from "~/stores/session-user-store"
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
import { pagesI18nNs } from "~/lib/i18n/config"
import type { InterestLevel, OpportunityStatusDefinition } from "~/lib/labels"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

const OPPORTUNITIES_VIEW_MODE_STORAGE_KEY_PREFIX =
  "job-vacancy-opportunities-view-mode-v1"

function opportunitiesViewModeStorageKey(userId: string): string {
  return `${OPPORTUNITIES_VIEW_MODE_STORAGE_KEY_PREFIX}:${userId}`
}

function isListingViewMode(value: string | null): value is ListingViewMode {
  return value === "list" || value === "kanban"
}

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
  const { t } = useTranslation(pagesI18nNs)
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

  const [loadState, setLoadState] = React.useState<
    "idle" | "loading" | "error"
  >("loading")
  const [listError, setListError] = React.useState<string | null>(null)

  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)

  const [dialogOppId, setDialogOppId] = React.useState<string | null>(null)
  const [statusQuickAddOpen, setStatusQuickAddOpen] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<ListingViewMode>("list")
  const sessionUserId = useSessionUserStore((s) => s.user.id)
  const [searchQuery, setSearchQuery] = React.useState("")
  const searchNeedle = searchQuery.trim()

  const [interestPatchError, setInterestPatchError] = React.useState<
    string | null
  >(null)

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
      setListError(apiErrorText(e, t("opportunities.load_error")))
    }
  }, [t])

  React.useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  React.useEffect(() => {
    if (!sessionUserId) return
    try {
      const storedMode = localStorage.getItem(
        opportunitiesViewModeStorageKey(sessionUserId)
      )
      if (isListingViewMode(storedMode)) {
        setViewMode(storedMode)
      } else {
        setViewMode("list")
      }
    } catch {
      setViewMode("list")
    }
  }, [sessionUserId])

  const handleViewModeChange = React.useCallback(
    (mode: ListingViewMode) => {
      setViewMode(mode)
      if (!sessionUserId) return
      try {
        localStorage.setItem(
          opportunitiesViewModeStorageKey(sessionUserId),
          mode
        )
      } catch {
        /* ignore localStorage failures */
      }
    },
    [sessionUserId]
  )

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
        prev.map((o) => (o.id === id ? { ...o, updated_at: optimisticTs } : o))
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
      setDeleteError(apiErrorText(e, t("opportunities.delete_error")))
    } finally {
      setDeleteSubmitting(false)
    }
  }

  async function patchInterestLevel(
    opp: Opportunity,
    nextLevel: InterestLevel
  ) {
    setInterestPatchError(null)
    try {
      await patchOpportunityOnServer(opp.id, { interest_level: nextLevel })
    } catch (e) {
      setInterestPatchError(apiErrorText(e, t("opportunities.interest_error")))
    }
  }

  return (
    <AppLayout title={t("opportunities.title")}>
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
          title={t("opportunities.title")}
          description={t("opportunities.description")}
          titleAccessory={
            <ListingViewModeToggle
              value={viewMode}
              onValueChange={handleViewModeChange}
              groupLabel={t("opportunities.view_group_label")}
              listLabel={t("opportunities.view_list")}
              kanbanLabel={t("opportunities.view_kanban")}
            />
          }
          action={
            <Button asChild>
              <Link to="/opportunities/opportunity">
                <PlusIcon data-icon="inline-start" />
                {t("opportunities.add")}
              </Link>
            </Button>
          }
        />

        {loadState === "error" ? (
          <p className="px-1 text-sm text-destructive" role="alert">
            {listError ?? t("shared.could_not_load_data")}{" "}
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 align-baseline text-destructive underline"
              onClick={() => void fetchAll()}
            >
              {t("shared.retry")}
            </Button>
          </p>
        ) : null}

        <ListingTableCard
          stats={
            loadState === "idle" && viewMode === "list" && totalCount > 0
              ? t("shared.showing_loaded_of_total", {
                  loaded: loadedCount,
                  total: totalCount,
                })
              : loadState === "idle" &&
                  viewMode === "kanban" &&
                  filteredOpportunities.length > 0
                ? filteredOpportunities.length === 1
                  ? t("opportunities.kanban_one", {
                      count: filteredOpportunities.length,
                    })
                  : t("opportunities.kanban_other", {
                      count: filteredOpportunities.length,
                    })
                : undefined
          }
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={t("opportunities.search_placeholder")}
        >
          {loadState === "loading" ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {t("opportunities.loading_list")}
            </p>
          ) : viewMode === "kanban" ? (
            opportunityStatuses.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <p className="max-w-md text-sm text-muted-foreground">
                  {t("opportunities.kanban_empty_statuses_intro")}
                </p>
                <Button
                  type="button"
                  onClick={() => setStatusQuickAddOpen(true)}
                >
                  <PlusIcon data-icon="inline-start" />
                  {t("opportunities.new_status")}
                </Button>
              </div>
            ) : opportunities.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t("opportunities.empty_list")}
              </p>
            ) : filteredOpportunities.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t("shared.no_matches_search")}
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
                  onOpportunityDoubleClick={(oppId: string) =>
                    setDialogOppId(oppId)
                  }
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
                  <TableHead className="w-28">{t("shared.actions")}</TableHead>
                  <TableHead>{t("shared.company")}</TableHead>
                  <TableHead>{t("shared.role")}</TableHead>
                  <TableHead>{t("opportunities.table_description")}</TableHead>
                  <TableHead>{t("shared.url")}</TableHead>
                  <TableHead>{t("shared.hourly_rate")}</TableHead>
                  <TableHead>{t("shared.annual_salary")}</TableHead>
                  <TableHead>{t("shared.status")}</TableHead>
                  <TableHead>{t("shared.interest")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {interestPatchError ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-sm text-destructive">
                      {interestPatchError}
                    </TableCell>
                  </TableRow>
                ) : null}
                {opportunities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-muted-foreground">
                      {t("opportunities.empty_list")}
                    </TableCell>
                  </TableRow>
                ) : filteredOpportunities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-muted-foreground">
                      {t("shared.no_matches_search")}
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
                                aria-label={t("opportunities.aria_edit")}
                              >
                                <PencilIcon />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={t("opportunities.aria_delete")}
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
                              {t("opportunities.url_link")}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
                          {formatOpportunityHourlyRate(opp.hourly_rate)}
                        </TableCell>
                        <TableCell className="text-sm whitespace-nowrap text-muted-foreground">
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
                            onChange={(nextLevel) =>
                              void patchInterestLevel(opp, nextLevel)
                            }
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
              <AlertDialogTitle>
                {t("opportunities.delete_title")}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t("opportunities.delete_desc")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteError ? (
              <p className="text-sm text-destructive" role="alert">
                {deleteError}
              </p>
            ) : null}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteSubmitting}>
                {t("shared.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={deleteSubmitting}
                onClick={(ev) => {
                  ev.preventDefault()
                  void confirmDelete()
                }}
              >
                {deleteSubmitting ? t("shared.deleting") : t("shared.delete")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  )
}
