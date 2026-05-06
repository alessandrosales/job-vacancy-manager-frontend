import * as React from "react"
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
      setListError(apiErrorText(e, "Could not load work experience."))
    }
  }, [])

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
      setDeleteError(apiErrorText(e, "Could not delete work experience."))
    } finally {
      setDeleteSubmitting(false)
    }
  }

  return (
    <AppLayout title="Work experience">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <ListingPageHeader
          title="Work experience"
          description="Roles and employers in your career history"
          action={
            <Button asChild>
              <Link to="/work-experiences/work-experience">
                <PlusIcon data-icon="inline-start" />
                Add experience
              </Link>
            </Button>
          }
        />
        <ListingTableCard
          stats={
            loadState === "idle" && totalCount > 0
              ? `Showing ${loadedCount} of ${totalCount}`
              : undefined
          }
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search experience…"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Actions</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Remote</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Skills</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadState === "loading" ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground">
                    Loading work experience…
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
                        Try again
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : workExperiences.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground">
                    No work experience yet. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-muted-foreground">
                    No matches for your search.
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
                            aria-label="Edit work experience"
                          >
                            <PencilIcon />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete work experience"
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
                    <TableCell>{row.is_remote ? "Yes" : "No"}</TableCell>
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
              <AlertDialogTitle>Delete work experience?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes the entry from your list.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteError ? (
              <p className="text-sm text-destructive" role="alert">
                {deleteError}
              </p>
            ) : null}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteSubmitting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={deleteSubmitting}
                onClick={(e) => {
                  e.preventDefault()
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
