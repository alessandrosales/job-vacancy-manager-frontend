import * as React from "react"
import { Link } from "react-router"

import { InfiniteScrollSentinelRow } from "~/components/listing/infinite-scroll-sentinel-row"
import { ListingPageHeader } from "~/components/listing/listing-page-header"
import { ListingTableCard } from "~/components/listing/listing-table-card"
import {
  useAppData,
  type ReferenceLink,
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

function hrefFromUrl(url: string): string {
  const t = url.trim()
  if (!t) return "#"
  if (/^https?:\/\//i.test(t)) return t
  return `https://${t}`
}

function filterLinksBySearch(
  rows: readonly ReferenceLink[],
  needle: string
): ReferenceLink[] {
  if (!needle) return [...rows]
  const q = needle.toLowerCase()
  return rows.filter((row) =>
    `${row.title} ${row.url}`.toLowerCase().includes(q)
  )
}

export default function LinksPage() {
  const { reference_links: referenceLinks, deleteReferenceLink } = useAppData()
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const searchNeedle = searchQuery.trim()

  const filteredLinks = React.useMemo(
    () => filterLinksBySearch(referenceLinks, searchNeedle),
    [referenceLinks, searchNeedle]
  )

  const {
    visibleItems,
    totalCount,
    loadedCount,
    hasMore,
    sentinelRef,
    loadNextWindow,
  } = useInfiniteScrollList(filteredLinks, { filterKey: searchNeedle })

  return (
    <AppLayout title="Links">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <ListingPageHeader
          title="Links"
          description="Bookmarks and URLs you use alongside your search"
          action={
            <Button asChild>
              <Link to="/links/link">
                <PlusIcon data-icon="inline-start" />
                Add link
              </Link>
            </Button>
          }
        />
        <ListingTableCard
          stats={
            totalCount > 0
              ? `Showing ${loadedCount} of ${totalCount}`
              : undefined
          }
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search links…"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-28">Actions</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referenceLinks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-muted-foreground">
                    No links yet. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : filteredLinks.length === 0 ? (
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
                            to={`/links/link/${encodeURIComponent(row.id)}`}
                            aria-label="Edit link"
                          >
                            <PencilIcon />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Delete link"
                          onClick={() => setDeleteId(row.id)}
                        >
                          <Trash2Icon />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{row.title}</TableCell>
                    <TableCell>
                      <a
                        href={hrefFromUrl(row.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        <span className="truncate">{row.url}</span>
                      </a>
                    </TableCell>
                  </TableRow>
                ))
              )}
              <InfiniteScrollSentinelRow
                colSpan={3}
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
              <AlertDialogTitle>Delete link?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes the link from your list.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  if (deleteId) deleteReferenceLink(deleteId)
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
