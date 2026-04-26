import * as React from "react"
import { Link } from "react-router"

import { InfiniteScrollSentinelRow } from "~/components/listing/infinite-scroll-sentinel-row"
import { ListingPageHeader } from "~/components/listing/listing-page-header"
import { ListingTableCard } from "~/components/listing/listing-table-card"
import { useAppData, type Education } from "~/components/providers/app-data-provider"
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

function filterEducation(rows: readonly Education[], needle: string): Education[] {
  if (!needle) return [...rows]
  const q = needle.toLowerCase()
  return rows.filter((r) =>
    `${r.institution_name} ${r.degree} ${r.field_of_study} ${r.date_from} ${r.date_to}`
      .toLowerCase()
      .includes(q)
  )
}

export default function EducationsPage() {
  const { education, deleteEducation } = useAppData()
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const searchNeedle = searchQuery.trim()

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

  return (
    <AppLayout title="Education">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <ListingPageHeader
          title="Education"
          description="Degrees and academic programs"
          action={
            <Button asChild>
              <Link to="/educations/education">
                <PlusIcon data-icon="inline-start" />
                Add education
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
          searchPlaceholder="Search education…"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Actions</TableHead>
                <TableHead>Institution</TableHead>
                <TableHead>Degree</TableHead>
                <TableHead>Field of study</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {education.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    No education entries yet. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
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
                            to={`/educations/education/${encodeURIComponent(row.id)}`}
                            aria-label="Edit education"
                          >
                            <PencilIcon />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete education"
                          onClick={() => setDeleteId(row.id)}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{row.institution_name}</TableCell>
                    <TableCell>{row.degree}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.field_of_study}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.date_from || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.date_to || "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
              <InfiniteScrollSentinelRow
                colSpan={6}
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
              <AlertDialogTitle>Delete education?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes the entry from your list.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  if (deleteId) deleteEducation(deleteId)
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
