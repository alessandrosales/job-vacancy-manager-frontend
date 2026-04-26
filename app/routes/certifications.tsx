import * as React from "react"
import { Link } from "react-router"

import { InfiniteScrollSentinelRow } from "~/components/listing/infinite-scroll-sentinel-row"
import { ListingPageHeader } from "~/components/listing/listing-page-header"
import { ListingTableCard } from "~/components/listing/listing-table-card"
import {
  useAppData,
  type Certification,
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

function filterCertifications(
  rows: readonly Certification[],
  needle: string
): Certification[] {
  if (!needle) return [...rows]
  const q = needle.toLowerCase()
  return rows.filter((r) =>
    `${r.name} ${r.date_from} ${r.date_to}`.toLowerCase().includes(q)
  )
}

export default function CertificationsPage() {
  const { certifications, deleteCertification } = useAppData()
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const searchNeedle = searchQuery.trim()

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

  return (
    <AppLayout title="Certifications">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <ListingPageHeader
          title="Certifications"
          description="Professional certifications and credentials"
          action={
            <Button asChild>
              <Link to="/certifications/certification">
                <PlusIcon data-icon="inline-start" />
                Add certification
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
          searchPlaceholder="Search certifications…"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Actions</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Valid from</TableHead>
                <TableHead>Valid to</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {certifications.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No certifications yet. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
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
                            to={`/certifications/certification/${encodeURIComponent(row.id)}`}
                            aria-label="Edit certification"
                          >
                            <PencilIcon />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete certification"
                          onClick={() => setDeleteId(row.id)}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{row.name}</TableCell>
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
                colSpan={4}
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
              <AlertDialogTitle>Delete certification?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes the certification from your list.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  if (deleteId) deleteCertification(deleteId)
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
