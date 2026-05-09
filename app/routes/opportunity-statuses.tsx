"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
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
import { pagesI18nNs } from "~/lib/i18n/config"
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
  const { t } = useTranslation(pagesI18nNs)
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
      setListError(apiErrorText(e, t("opportunity_statuses.load_error")))
    }
  }, [t])

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
      setReorderError(apiErrorText(e, t("opportunity_statuses.reorder_error")))
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
      setDeleteError(apiErrorText(e, t("opportunity_statuses.delete_error")))
    } finally {
      setDeleteSubmitting(false)
    }
  }

  return (
    <AppLayout title={t("opportunity_statuses.title")}>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <ListingPageHeader
          title={t("opportunity_statuses.title")}
          description={t("opportunity_statuses.description")}
          action={
            <Button asChild>
              <Link to="/opportunities/status">
                <PlusIcon data-icon="inline-start" />
                {t("opportunity_statuses.add")}
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
              ? t("shared.showing_loaded_of_total", {
                  loaded: loadedCount,
                  total: totalCount,
                })
              : undefined
          }
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder={t("opportunity_statuses.search_placeholder")}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">{t("shared.actions")}</TableHead>
                <TableHead className="w-24">{t("shared.order")}</TableHead>
                <TableHead>{t("shared.label")}</TableHead>
                <TableHead>{t("shared.description")}</TableHead>
                <TableHead className="w-40">{t("shared.style")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadState === "loading" ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    {t("opportunity_statuses.loading")}
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
                        {t("shared.try_again")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : statuses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    {t("opportunity_statuses.empty")}
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    {t("shared.no_matches_search")}
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
                              aria-label={t("opportunity_statuses.aria_edit")}
                            >
                              <PencilIcon />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t("opportunity_statuses.aria_delete")}
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
                            aria-label={t("opportunity_statuses.move_up")}
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
                            aria-label={t("opportunity_statuses.move_down")}
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
              <AlertDialogTitle>{t("opportunity_statuses.delete_title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("opportunity_statuses.delete_desc")}
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
                onClick={(e) => {
                  e.preventDefault()
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
