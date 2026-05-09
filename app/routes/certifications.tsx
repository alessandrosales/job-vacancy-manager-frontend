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
  deleteCertification as deleteCertificationRequest,
  listCertifications,
  type ApiCertification,
} from "~/lib/api/resources/certifications"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

function filterCertifications(
  rows: readonly ApiCertification[],
  needle: string
): ApiCertification[] {
  if (!needle) return [...rows]
  const q = needle.toLowerCase()
  return rows.filter((r) =>
    `${r.name} ${r.date_from ?? ""} ${r.date_to ?? ""}`
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

export default function CertificationsPage() {
  const { t } = useTranslation(pagesI18nNs)
  const [certifications, setCertifications] = React.useState<ApiCertification[]>(
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

  const fetchCertifications = React.useCallback(async () => {
    setLoadState("loading")
    setListError(null)
    try {
      const data = await listCertifications({ paginated: false })
      setCertifications(data)
      setLoadState("idle")
    } catch (e) {
      setLoadState("error")
      setListError(apiErrorText(e, t("certifications.load_error")))
    }
  }, [t])

  React.useEffect(() => {
    void fetchCertifications()
  }, [fetchCertifications])

  const filtered = React.useMemo(
    () => filterCertifications(certifications, searchNeedle),
    [certifications, searchNeedle]
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
      await deleteCertificationRequest(deleteId)
      setCertifications((prev) => prev.filter((row) => row.id !== deleteId))
      setDeleteId(null)
    } catch (e) {
      setDeleteError(apiErrorText(e, t("certifications.delete_error")))
    } finally {
      setDeleteSubmitting(false)
    }
  }

  return (
    <AppLayout title={t("certifications.title")}>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <ListingPageHeader
          title={t("certifications.title")}
          description={t("certifications.description")}
          action={
            <Button asChild>
              <Link to="/certifications/certification">
                <PlusIcon data-icon="inline-start" />
                {t("certifications.add")}
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
          searchPlaceholder={t("certifications.search_placeholder")}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">{t("shared.actions")}</TableHead>
                <TableHead>{t("shared.name")}</TableHead>
                <TableHead>{t("shared.valid_from")}</TableHead>
                <TableHead>{t("shared.valid_to")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadState === "loading" ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    {t("certifications.loading")}
                  </TableCell>
                </TableRow>
              ) : loadState === "error" ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-destructive">{listError}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void fetchCertifications()}
                      >
                        {t("shared.try_again")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : certifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    {t("certifications.empty")}
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
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
                            to={`/certifications/certification/${encodeURIComponent(row.id)}`}
                            aria-label={t("certifications.aria_edit")}
                          >
                            <PencilIcon />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t("certifications.aria_delete")}
                          onClick={() => {
                            setDeleteError(null)
                            setDeleteId(row.id)
                          }}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.date_from ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.date_to ?? "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
              {loadState === "idle" && certifications.length > 0 ? (
                <InfiniteScrollSentinelRow
                  colSpan={4}
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
              <AlertDialogTitle>{t("certifications.delete_title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("certifications.delete_desc")}
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
