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
  deleteSkill as deleteSkillRequest,
  listSkills,
  type ApiSkill,
} from "~/lib/api/resources/skills"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

function filterSkillsBySearch(rows: readonly ApiSkill[], needle: string): ApiSkill[] {
  if (!needle) return [...rows]
  const q = needle.toLowerCase()
  return rows.filter((s) =>
    `${s.name} ${s.description ?? ""}`.toLowerCase().includes(q)
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

export default function SkillsPage() {
  const { t } = useTranslation(pagesI18nNs)
  const [skills, setSkills] = React.useState<ApiSkill[]>([])
  const [loadState, setLoadState] = React.useState<"idle" | "loading" | "error">(
    "loading"
  )
  const [listError, setListError] = React.useState<string | null>(null)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const searchNeedle = searchQuery.trim()

  const fetchSkills = React.useCallback(async () => {
    setLoadState("loading")
    setListError(null)
    try {
      const data = await listSkills({ paginated: false })
      setSkills(data)
      setLoadState("idle")
    } catch (e) {
      setLoadState("error")
      setListError(apiErrorText(e, t("skills.load_error")))
    }
  }, [t])

  React.useEffect(() => {
    void fetchSkills()
  }, [fetchSkills])

  const filteredSkills = React.useMemo(
    () => filterSkillsBySearch(skills, searchNeedle),
    [skills, searchNeedle]
  )

  const {
    visibleItems,
    totalCount,
    loadedCount,
    hasMore,
    sentinelRef,
    loadNextWindow,
  } = useInfiniteScrollList(filteredSkills, { filterKey: searchNeedle })

  async function confirmDelete() {
    if (!deleteId) return
    setDeleteSubmitting(true)
    setDeleteError(null)
    try {
      await deleteSkillRequest(deleteId)
      setSkills((prev) => prev.filter((s) => s.id !== deleteId))
      setDeleteId(null)
    } catch (e) {
      setDeleteError(apiErrorText(e, t("skills.delete_error")))
    } finally {
      setDeleteSubmitting(false)
    }
  }

  return (
    <AppLayout title={t("skills.title")}>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <ListingPageHeader
          title={t("skills.title")}
          description={t("skills.description")}
          action={
            <Button asChild>
              <Link to="/skills/skill">
                <PlusIcon data-icon="inline-start" />
                {t("skills.add")}
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
          searchPlaceholder={t("skills.search_placeholder")}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">{t("shared.actions")}</TableHead>
                <TableHead>{t("shared.name")}</TableHead>
                <TableHead>{t("shared.description")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadState === "loading" ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    {t("skills.loading")}
                  </TableCell>
                </TableRow>
              ) : loadState === "error" ? (
                <TableRow>
                  <TableCell colSpan={3}>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-destructive">{listError}</span>
                      <Button type="button" variant="outline" size="sm" onClick={() => void fetchSkills()}>
                        {t("shared.try_again")}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : skills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    {t("skills.empty")}
                  </TableCell>
                </TableRow>
              ) : filteredSkills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    {t("shared.no_matches_search")}
                  </TableCell>
                </TableRow>
              ) : (
                visibleItems.map((skill) => (
                  <TableRow key={skill.id}>
                    <TableCell>
                      <div className="flex justify-start gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link
                            to={`/skills/skill/${encodeURIComponent(skill.id)}`}
                            aria-label={t("skills.aria_edit")}
                          >
                            <PencilIcon />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t("skills.aria_delete")}
                          onClick={() => {
                            setDeleteError(null)
                            setDeleteId(skill.id)
                          }}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{skill.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {skill.description ?? "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
              {loadState === "idle" && skills.length > 0 ? (
                <InfiniteScrollSentinelRow
                  colSpan={3}
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
              <AlertDialogTitle>{t("skills.delete_title")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("skills.delete_desc")}
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
