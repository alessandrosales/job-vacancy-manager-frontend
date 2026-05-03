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
  deleteLanguage as deleteLanguageRequest,
  listLanguages,
  type ApiLanguage,
} from "~/lib/api/resources/languages"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

function languageLevelLabel(level: string): string {
  switch (level) {
    case "beginner":
      return "Beginner"
    case "intermediate":
      return "Intermediate"
    case "advanced":
      return "Advanced"
    case "native":
      return "Native"
    default:
      return level
  }
}

function filterLanguagesBySearch(rows: readonly ApiLanguage[], needle: string): ApiLanguage[] {
  if (!needle) return [...rows]
  const q = needle.toLowerCase()
  return rows.filter((row) =>
    `${row.name} ${row.level}`.toLowerCase().includes(q)
  )
}

function listErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const base = err.fieldErrors.base?.[0]
    if (base) return base
    const firstField = Object.values(err.fieldErrors).flat()[0]
    if (firstField) return firstField
  }
  return "Could not load languages."
}

export default function LanguagesPage() {
  const [languages, setLanguages] = React.useState<ApiLanguage[]>([])
  const [loadState, setLoadState] = React.useState<"idle" | "loading" | "error">(
    "loading"
  )
  const [listError, setListError] = React.useState<string | null>(null)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const searchNeedle = searchQuery.trim()

  const fetchLanguages = React.useCallback(async () => {
    setLoadState("loading")
    setListError(null)
    try {
      const data = await listLanguages({ paginated: false })
      setLanguages(data)
      setLoadState("idle")
    } catch (e) {
      setLoadState("error")
      setListError(listErrorMessage(e))
    }
  }, [])

  React.useEffect(() => {
    void fetchLanguages()
  }, [fetchLanguages])

  const filteredLanguages = React.useMemo(
    () => filterLanguagesBySearch(languages, searchNeedle),
    [languages, searchNeedle]
  )

  const {
    visibleItems,
    totalCount,
    loadedCount,
    hasMore,
    sentinelRef,
    loadNextWindow,
  } = useInfiniteScrollList(filteredLanguages, { filterKey: searchNeedle })

  async function confirmDelete() {
    if (!deleteId) return
    setDeleteSubmitting(true)
    setDeleteError(null)
    try {
      await deleteLanguageRequest(deleteId)
      setLanguages((prev) => prev.filter((row) => row.id !== deleteId))
      setDeleteId(null)
    } catch (e) {
      setDeleteError(listErrorMessage(e))
    } finally {
      setDeleteSubmitting(false)
    }
  }

  return (
    <AppLayout title="Languages">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <ListingPageHeader
          title="Languages"
          description="Languages you speak — used like skills and roles across the app"
          action={
            <Button asChild>
              <Link to="/languages/language">
                <PlusIcon data-icon="inline-start" />
                Add language
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
          searchPlaceholder="Search languages…"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Actions</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadState === "loading" ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    Loading languages…
                  </TableCell>
                </TableRow>
              ) : loadState === "error" ? (
                <TableRow>
                  <TableCell colSpan={3}>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-destructive">{listError}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void fetchLanguages()}
                      >
                        Try again
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : languages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    No languages yet. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : filteredLanguages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
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
                            to={`/languages/language/${encodeURIComponent(row.id)}`}
                            aria-label="Edit language"
                          >
                            <PencilIcon />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete language"
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
                      {languageLevelLabel(row.level)}
                    </TableCell>
                  </TableRow>
                ))
              )}
              {loadState === "idle" && languages.length > 0 ? (
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
              <AlertDialogTitle>Delete language?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes the language from your list.
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
