import * as React from "react"
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
import {
  deleteCompany as deleteCompanyRequest,
  listCompanies,
  updateCompany as updateCompanyRequest,
  type ApiCompany,
} from "~/lib/api/resources/companies"
import type { InterestLevel } from "~/lib/labels"
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

function filterCompaniesBySearch(
  rows: readonly ApiCompany[],
  needle: string
): ApiCompany[] {
  if (!needle) return [...rows]
  const q = needle.toLowerCase()
  return rows.filter((c) =>
    `${c.name} ${c.url ?? ""} ${c.description ?? ""} ${c.interest_level}`
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

export default function CompaniesPage() {
  const [companies, setCompanies] = React.useState<ApiCompany[]>([])
  const [loadState, setLoadState] = React.useState<"idle" | "loading" | "error">(
    "loading"
  )
  const [listError, setListError] = React.useState<string | null>(null)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)
  const [interestPatchId, setInterestPatchId] = React.useState<string | null>(null)
  const [interestPatchError, setInterestPatchError] = React.useState<string | null>(
    null
  )
  const [searchQuery, setSearchQuery] = React.useState("")
  const searchNeedle = searchQuery.trim()

  const fetchCompanies = React.useCallback(async () => {
    setLoadState("loading")
    setListError(null)
    try {
      const data = await listCompanies({ paginated: false })
      setCompanies(data)
      setLoadState("idle")
    } catch (e) {
      setLoadState("error")
      setListError(apiErrorText(e, "Could not load companies."))
    }
  }, [])

  React.useEffect(() => {
    void fetchCompanies()
  }, [fetchCompanies])

  const filteredCompanies = React.useMemo(
    () => filterCompaniesBySearch(companies, searchNeedle),
    [companies, searchNeedle]
  )

  const {
    visibleItems,
    totalCount,
    loadedCount,
    hasMore,
    sentinelRef,
    loadNextWindow,
  } = useInfiniteScrollList(filteredCompanies, { filterKey: searchNeedle })

  async function confirmDelete() {
    if (!deleteId) return
    setDeleteSubmitting(true)
    setDeleteError(null)
    try {
      await deleteCompanyRequest(deleteId)
      setCompanies((prev) => prev.filter((c) => c.id !== deleteId))
      setDeleteId(null)
    } catch (e) {
      setDeleteError(apiErrorText(e, "Could not delete company."))
    } finally {
      setDeleteSubmitting(false)
    }
  }

  async function patchInterestLevel(company: ApiCompany, nextLevel: InterestLevel) {
    setInterestPatchError(null)
    setInterestPatchId(company.id)
    try {
      const updated = await updateCompanyRequest(company.id, {
        interest_level: nextLevel,
      })
      setCompanies((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
    } catch (e) {
      setInterestPatchError(apiErrorText(e, "Could not update interest level."))
    } finally {
      setInterestPatchId(null)
    }
  }

  return (
    <AppLayout title="Companies">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <ListingPageHeader
          title="Companies"
          description="Companies you are tracking for opportunities"
          action={
            <Button asChild>
              <Link to="/companies/company">
                <PlusIcon data-icon="inline-start" />
                Add company
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
              ? `Showing ${loadedCount} of ${totalCount}`
              : undefined
          }
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search companies…"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Actions</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Interest Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadState === "loading" ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    Loading companies…
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
                        onClick={() => void fetchCompanies()}
                      >
                        Try again
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : companies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No companies yet. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No matches for your search.
                  </TableCell>
                </TableRow>
              ) : (
                visibleItems.map((company) => {
                  const disabledStars = interestPatchId === company.id
                  return (
                    <TableRow key={company.id}>
                      <TableCell>
                        <div className="flex justify-start gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link
                              to={`/companies/company/${encodeURIComponent(company.id)}`}
                              aria-label="Edit company"
                            >
                              <PencilIcon />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="Delete company"
                            onClick={() => {
                              setDeleteError(null)
                              setDeleteId(company.id)
                            }}
                          >
                            <Trash2Icon />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>
                        {company.url ? (
                          <a
                            href={company.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline-offset-4 hover:underline"
                          >
                            {company.url}
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-muted-foreground">
                        {company.description ?? "—"}
                      </TableCell>
                      <TableCell>
                        <div
                          className={disabledStars ? "pointer-events-none opacity-60" : undefined}
                        >
                          <InterestLevelStarPicker
                            value={company.interest_level as InterestLevel}
                            size="sm"
                            showValueLabel={false}
                            onChange={(nextLevel) =>
                              void patchInterestLevel(company, nextLevel)
                            }
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
              {loadState === "idle" && companies.length > 0 ? (
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
              <AlertDialogTitle>Delete company?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes the company from your list.
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
