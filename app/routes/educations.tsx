"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router"

import { InfiniteScrollSentinelRow } from "~/components/listing/infinite-scroll-sentinel-row"
import { ListingPageHeader } from "~/components/listing/listing-page-header"
import { ListingTableCard } from "~/components/listing/listing-table-card"
import { AppLayout } from "~/components/layout/app-layout"
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
  deleteEducation as deleteEducationRequest,
  listEducations,
  type ApiEducation,
} from "~/lib/api/resources/educations"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

function filterEducation(
  rows: readonly ApiEducation[],
  needle: string
): ApiEducation[] {
  if (!needle) return [...rows]
  const q = needle.toLowerCase()
  return rows.filter((r) =>
    `${r.institution_name} ${r.degree ?? ""} ${r.field_of_study ?? ""} ${r.date_from ?? ""} ${r.date_to ?? ""}`
      .toLowerCase()
      .includes(q)
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

export default function EducationsPage() {
  const { t } = useTranslation(pagesI18nNs)
  const [education, setEducation] = React.useState<ApiEducation[]>([])
  const [loadState, setLoadState] = React.useState<"idle" | "loading" | "error">(
    "loading"
  )
  const [listError, setListError] = React.useState<string | null>(null)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const searchNeedle = searchQuery.trim()

  const fetchEducations = React.useCallback(async () => {
    setLoadState("loading")
    setListError(null)
    try {
      const data = await listEducations({ paginated: false })
      setEducation(data)
      setLoadState("idle")
    } catch (e) {
      setLoadState("error")
      setListError(apiErrorText(e, t("educations.load_error")))
    }
  }, [t])

  React.useEffect(() => {
    void fetchEducations()
  }, [fetchEducations])

  const filtered = React.useMemo(
    () => filterEducation(education, searchNeedle),
    [education, searchNeedle]
  )

  const {
    visibleItems,
    totalCount,
    loadedCount,
    hasMore,
    sentinelRef,
    loadNextWindow,
  } = useInfiniteScrollList(filtered, { filterKey: searchNeedle })

  async function confirmDelete() {
    if (!deleteId) return
    setDeleteSubmitting(true)
    setDeleteError(null)
    try {
      await deleteEducationRequest(deleteId)
      setEducation((prev) => prev.filter((row) => row.id !== deleteId))
      setDeleteId(null)
    } catch (e) {
      setDeleteError(apiErrorText(e, t("educations.delete_error")))
    } finally {
      setDeleteSubmitting(false)
    }
  }

  return (
    <AppLayout title={t("educations.title")}>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <ListingPageHeader
          title={t("educations.title")}
          description={t("educations.description")}
          action={
            <Button asChild>
              <Link to="/educations/education">
                <PlusIcon data-icon="inline-start" />
                {t("educations.add")}
              </Link>
            </Button>
          }
        />
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
          searchPlaceholder={t("educations.search_placeholder")}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">{t("shared.actions")}</TableHead>
                <TableHead>{t("shared.institution")}</TableHead>
                <TableHead>{t("shared.degree")}</TableHead>
                <TableHead>{t("shared.field_of_study")}</TableHead>
                <TableHead>{t("shared.from")}</TableHead>
                <TableHead>{t("shared.to")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadState === "loading" ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    {t("educations.loading")}
                  </TableCell>
                </TableRow>
              ) : loadState === "error" ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-destructive">{listError}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void fetchEducations()}
                      >
                        {t("shared.try_again")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : education.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    {t("educations.empty")}
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    {t("shared.no_matches_search")}
                  </TableCell>
                </TableRow>
              ) : (
                visibleItems.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="flex justify-start gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            to={`/educations/education/${encodeURIComponent(row.id)}`}
                            aria-label={t("educations.aria_edit")}
                          >
                            <PencilIcon />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t("educations.aria_delete")}
                          onClick={() => {
                            setDeleteError(null)
                            setDeleteId(row.id)
                          }}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{row.institution_name}</TableCell>
                    <TableCell>{row.degree ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.field_of_study ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.date_from ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.date_to ?? "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
              {loadState === "idle" && education.length > 0 ? (
                <InfiniteScrollSentinelRow
                  colSpan={6}
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
              <AlertDialogTitle>{t("educations.delete_title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("educations.delete_desc")}
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
