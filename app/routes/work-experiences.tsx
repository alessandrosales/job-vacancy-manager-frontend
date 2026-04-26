import * as React from "react"
import { Link } from "react-router"

import { InfiniteScrollSentinelRow } from "~/components/listing/infinite-scroll-sentinel-row"
import { ListingPageHeader } from "~/components/listing/listing-page-header"
import { ListingTableCard } from "~/components/listing/listing-table-card"
import {
  useAppData,
  type WorkExperience,
} from "~/components/providers/app-data-provider"
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
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

function filterWorkExperiences(
  rows: readonly WorkExperience[],
  needle: string
): WorkExperience[] {
  if (!needle) return [...rows]
  const q = needle.toLowerCase()
  return rows.filter((r) =>
    `${r.title} ${r.company_name} ${r.date_from} ${r.date_to} ${r.is_remote ? "remote" : ""}`
      .toLowerCase()
      .includes(q)
  )
}

export default function WorkExperiencesPage() {
  const { work_experiences, deleteWorkExperience } = useAppData()
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const searchNeedle = searchQuery.trim()

  const filtered = React.useMemo(
    () => filterWorkExperiences(work_experiences, searchNeedle),
    [work_experiences, searchNeedle]
  )

  const {
    visibleItems,
    totalCount,
    loadedCount,
    hasMore,
    sentinelRef,
    loadNextWindow,
  } = useInfiniteScrollList(filtered, { filterKey: searchNeedle })

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
            totalCount > 0 ? `Showing ${loadedCount} of ${totalCount}` : undefined
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
                <TableHead>Remote</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Skills</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {work_experiences.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground">
                    No work experience yet. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-muted-foreground">
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
                          onClick={() => setDeleteId(row.id)}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{row.title}</TableCell>
                    <TableCell>{row.company_name}</TableCell>
                    <TableCell>{row.is_remote ? "Yes" : "No"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.date_from || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.date_to || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.skill_ids.length}
                    </TableCell>
                  </TableRow>
                ))
              )}
              <InfiniteScrollSentinelRow
                colSpan={7}
                sentinelRef={sentinelRef}
                hasMore={hasMore}
                totalCount={totalCount}
                loadedCount={loadedCount}
                loadNextWindow={loadNextWindow}
              />
            </TableBody>
          </Table>
        </ListingTableCard>

        <AlertDialog
          open={deleteId !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteId(null)
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete work experience?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes the entry from your list.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  if (deleteId) deleteWorkExperience(deleteId)
                  setDeleteId(null)
                }}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  )
}
