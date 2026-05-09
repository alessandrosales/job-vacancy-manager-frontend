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
  deleteWorkExperience as deleteWorkExperienceRequest,
  listWorkExperiences,
  type ApiWorkExperience,
} from "~/lib/api/resources/work-experiences"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

function filterWorkExperiences(
  rows: readonly ApiWorkExperience[],
  needle: string
): ApiWorkExperience[] {
  if (!needle) return [...rows]
  const q = needle.toLowerCase()
  return rows.filter((r) =>
    `${r.title} ${r.company_name} ${r.description ?? ""} ${r.date_from ?? ""} ${r.date_to ?? ""} ${r.is_remote ? "remote" : ""}`
      .toLowerCase()
      .includes(q)
  )
}

function skillCount(row: ApiWorkExperience): number {
  return row.skill_ids?.length ?? 0
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

export default function WorkExperiencesPage() {
  const { t } = useTranslation(pagesI18nNs)
  const [workExperiences, setWorkExperiences] = React.useState<ApiWorkExperience[]>(
    []
  )
  const [loadState, setLoadState] = React.useState<"idle" | "loading" | "error">(
    "loading"
  )
  const [listError, setListError] = React.useState<string | null>(null)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const searchNeedle = searchQuery.trim()

  const fetchWorkExperiences = React.useCallback(async () => {
    setLoadState("loading")
    setListError(null)
    try {
      const data = await listWorkExperiences({ paginated: false })
      setWorkExperiences(data)
      setLoadState("idle")
    } catch (e) {
      setLoadState("error")
      setListError(apiErrorText(e, t("work_experience.load_error")))
    }
  }, [t])

  React.useEffect(() => {
    void fetchWorkExperiences()
  }, [fetchWorkExperiences])

  const filtered = React.useMemo(
    () => filterWorkExperiences(workExperiences, searchNeedle),
    [workExperiences, searchNeedle]
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
      await deleteWorkExperienceRequest(deleteId)
      setWorkExperiences((prev) => prev.filter((row) => row.id !== deleteId))
      setDeleteId(null)
    } catch (e) {
      setDeleteError(apiErrorText(e, t("work_experience.delete_error")))
    } finally {
      setDeleteSubmitting(false)
    }
  }

  return (
    <AppLayout title={t("work_experience.list_title")}>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <ListingPageHeader
          title={t("work_experience.list_title")}
          description={t("work_experience.list_description")}
          action={
            <Button asChild>
              <Link to="/work-experiences/work-experience">
                <PlusIcon data-icon="inline-start" />
                {t("work_experience.add")}
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
          searchPlaceholder={t("work_experience.search_placeholder")}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">{t("shared.actions")}</TableHead>
                <TableHead>{t("shared.title")}</TableHead>
                <TableHead>{t("shared.company")}</TableHead>
                <TableHead>{t("shared.description")}</TableHead>
                <TableHead>{t("shared.remote")}</TableHead>
                <TableHead>{t("shared.from")}</TableHead>
                <TableHead>{t("shared.to")}</TableHead>
                <TableHead>{t("shared.skills")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadState === "loading" ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground">
                    {t("work_experience.loading_list")}
                  </TableCell>
                </TableRow>
              ) : loadState === "error" ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-destructive">{listError}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void fetchWorkExperiences()}
                      >
                        {t("shared.try_again")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : workExperiences.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground">
                    {t("work_experience.empty")}
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground">
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
                            to={`/work-experiences/work-experience/${encodeURIComponent(row.id)}`}
                            aria-label={t("work_experience.aria_edit")}
                          >
                            <PencilIcon />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t("work_experience.aria_delete")}
                          onClick={() => {
                            setDeleteError(null)
                            setDeleteId(row.id)
                          }}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{row.title}</TableCell>
                    <TableCell>{row.company_name}</TableCell>
                    <TableCell className="max-w-xs truncate text-muted-foreground">
                      {row.description?.trim() ? row.description : "—"}
                    </TableCell>
                    <TableCell>{row.is_remote ? t("shared.yes") : t("shared.no")}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.date_from ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.date_to ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {skillCount(row)}
                    </TableCell>
                  </TableRow>
                ))
              )}
              {loadState === "idle" && workExperiences.length > 0 ? (
                <InfiniteScrollSentinelRow
                  colSpan={8}
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
              <AlertDialogTitle>{t("work_experience.delete_title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("work_experience.delete_desc")}
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
