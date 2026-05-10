"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router"

import { InfiniteScrollSentinelRow } from "~/components/listing/infinite-scroll-sentinel-row"
import { ListingPageHeader } from "~/components/listing/listing-page-header"
import { ListingTableCard } from "~/components/listing/listing-table-card"
import { InterestLevelStarPicker } from "~/components/shared/interest-level-star-picker"
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
  deleteRole as deleteRoleRequest,
  listRoles,
  updateRole as updateRoleRequest,
  type ApiRole,
} from "~/lib/api/resources/roles"
import type { InterestLevel } from "~/lib/labels"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

function filterRolesBySearch(
  rows: readonly ApiRole[],
  needle: string
): ApiRole[] {
  if (!needle) return [...rows]
  const q = needle.toLowerCase()
  return rows.filter((r) =>
    `${r.name} ${r.description ?? ""} ${r.interest_level}`
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

export default function RolesPage() {
  const { t } = useTranslation(pagesI18nNs)
  const [roles, setRoles] = React.useState<ApiRole[]>([])
  const [loadState, setLoadState] = React.useState<
    "idle" | "loading" | "error"
  >("loading")
  const [listError, setListError] = React.useState<string | null>(null)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)
  const [interestPatchId, setInterestPatchId] = React.useState<string | null>(
    null
  )
  const [interestPatchError, setInterestPatchError] = React.useState<
    string | null
  >(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const searchNeedle = searchQuery.trim()

  const fetchRoles = React.useCallback(async () => {
    setLoadState("loading")
    setListError(null)
    try {
      const data = await listRoles({ paginated: false })
      setRoles(data)
      setLoadState("idle")
    } catch (e) {
      setLoadState("error")
      setListError(apiErrorText(e, t("roles.load_error")))
    }
  }, [t])

  React.useEffect(() => {
    void fetchRoles()
  }, [fetchRoles])

  const filteredRoles = React.useMemo(
    () => filterRolesBySearch(roles, searchNeedle),
    [roles, searchNeedle]
  )

  const {
    visibleItems,
    totalCount,
    loadedCount,
    hasMore,
    sentinelRef,
    loadNextWindow,
  } = useInfiniteScrollList(filteredRoles, { filterKey: searchNeedle })

  async function confirmDelete() {
    if (!deleteId) return
    setDeleteSubmitting(true)
    setDeleteError(null)
    try {
      await deleteRoleRequest(deleteId)
      setRoles((prev) => prev.filter((r) => r.id !== deleteId))
      setDeleteId(null)
    } catch (e) {
      setDeleteError(apiErrorText(e, t("roles.delete_error")))
    } finally {
      setDeleteSubmitting(false)
    }
  }

  async function patchInterestLevel(role: ApiRole, nextLevel: InterestLevel) {
    setInterestPatchError(null)
    setInterestPatchId(role.id)
    try {
      const updated = await updateRoleRequest(role.id, {
        interest_level: nextLevel,
      })
      setRoles((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    } catch (e) {
      setInterestPatchError(apiErrorText(e, t("roles.interest_error")))
    } finally {
      setInterestPatchId(null)
    }
  }

  return (
    <AppLayout title={t("roles.title")}>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <ListingPageHeader
          title={t("roles.title")}
          description={t("roles.description")}
          action={
            <Button asChild>
              <Link to="/roles/role">
                <PlusIcon data-icon="inline-start" />
                {t("roles.add")}
              </Link>
            </Button>
          }
        />
        {interestPatchError ? (
          <p className="text-sm text-destructive" role="alert">
            {interestPatchError}
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
          searchPlaceholder={t("roles.search_placeholder")}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">{t("shared.actions")}</TableHead>
                <TableHead>{t("shared.name")}</TableHead>
                <TableHead>{t("shared.description")}</TableHead>
                <TableHead>{t("shared.interest_level")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadState === "loading" ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    {t("roles.loading")}
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
                        onClick={() => void fetchRoles()}
                      >
                        {t("shared.try_again")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    {t("roles.empty")}
                  </TableCell>
                </TableRow>
              ) : filteredRoles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    {t("shared.no_matches_search")}
                  </TableCell>
                </TableRow>
              ) : (
                visibleItems.map((role) => {
                  const disabledStars = interestPatchId === role.id
                  return (
                    <TableRow key={role.id}>
                      <TableCell>
                        <div className="flex justify-start gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link
                              to={`/roles/role/${encodeURIComponent(role.id)}`}
                              aria-label={t("roles.aria_edit")}
                            >
                              <PencilIcon />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={t("roles.aria_delete")}
                            onClick={() => {
                              setDeleteError(null)
                              setDeleteId(role.id)
                            }}
                          >
                            <Trash2Icon />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell className="max-w-sm truncate text-muted-foreground">
                        {role.description ?? "—"}
                      </TableCell>
                      <TableCell>
                        <div
                          className={
                            disabledStars
                              ? "pointer-events-none opacity-60"
                              : undefined
                          }
                        >
                          <InterestLevelStarPicker
                            value={role.interest_level as InterestLevel}
                            size="sm"
                            showValueLabel={false}
                            onChange={(nextLevel) =>
                              void patchInterestLevel(role, nextLevel)
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
              {loadState === "idle" && roles.length > 0 ? (
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
              <AlertDialogTitle>{t("roles.delete_title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("roles.delete_desc")}
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
