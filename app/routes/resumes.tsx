import * as React from "react"
import { Link } from "react-router"

import { ListingPageHeader } from "~/components/listing/listing-page-header"
import { ListingTableCard } from "~/components/listing/listing-table-card"
import {
  useAppData,
  type ResumeDocument,
} from "~/components/providers/app-data-provider"
import { AppLayout } from "~/components/layout/app-layout"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
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
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"

function filterResumes(
  rows: readonly ResumeDocument[],
  needle: string,
  roleNameById: Map<string, string>
): ResumeDocument[] {
  if (!needle) return [...rows]
  const q = needle.toLowerCase()
  return rows.filter((r) => {
    const roleName = r.role_id ? (roleNameById.get(r.role_id) ?? "") : ""
    return `${r.title} ${r.description} ${r.updated_at} ${roleName}`
      .toLowerCase()
      .includes(q)
  })
}

function formatUpdated(isoDate: string): string {
  const t = Date.parse(`${isoDate}T12:00:00`)
  if (Number.isNaN(t)) return isoDate
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(t)
}

export default function ResumesPage() {
  const { resumes, deleteResume, roles } = useAppData()
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const searchNeedle = searchQuery.trim()

  const roleNameById = React.useMemo(
    () => new Map(roles.map((role) => [role.id, role.name] as const)),
    [roles]
  )

  const filtered = React.useMemo(
    () => filterResumes(resumes, searchNeedle, roleNameById),
    [resumes, searchNeedle, roleNameById]
  )

  const totalCount = resumes.length
  const shownCount = filtered.length

  return (
    <AppLayout title="Resumes">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <ListingPageHeader
          title="Resumes"
          description="Saved CV versions — browse as cards and open one to edit."
          action={
            <Button asChild>
              <Link to="/resumes/resume">
                <PlusIcon data-icon="inline-start" />
                Add resume
              </Link>
            </Button>
          }
        />
        <ListingTableCard
          stats={
            totalCount > 0
              ? searchNeedle
                ? `Showing ${shownCount} of ${totalCount}`
                : `${totalCount} saved`
              : undefined
          }
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search resumes…"
        >
          {resumes.length === 0 ? (
            <div className="text-muted-foreground flex flex-1 flex-col items-center justify-center gap-2 py-16 text-center text-sm">
              <p>No resumes yet.</p>
              <Button asChild variant="outline" size="sm">
                <Link to="/resumes/resume">Add your first resume</Link>
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center text-sm">
              No matches for your search.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((r) => {
                const roleLabel = r.role_id ? roleNameById.get(r.role_id) : undefined
                return (
                <Card key={r.id} className="flex flex-col">
                  <CardHeader className="flex flex-col gap-2">
                    <CardTitle className="line-clamp-2 text-lg leading-snug">
                      {r.title}
                    </CardTitle>
                    <CardDescription>
                      Updated {formatUpdated(r.updated_at)}
                      {roleLabel ? ` · ${roleLabel}` : null}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-2">
                    <p className="text-muted-foreground text-xs leading-relaxed">
                      {r.work_experience_ids.length} work experiences ·{" "}
                      {r.certification_ids.length} certifications · {r.education_ids.length}{" "}
                      education · {r.skill_ids.length} skills
                    </p>
                    <p className="text-muted-foreground line-clamp-4 text-sm leading-relaxed">
                      {r.description}
                    </p>
                  </CardContent>
                  <CardFooter className="mt-auto flex flex-wrap justify-end gap-2 border-t border-border pt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      aria-label={`Delete ${r.title}`}
                      onClick={() => setDeleteId(r.id)}
                    >
                      <Trash2Icon data-icon="inline-start" />
                      Delete
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        to={`/resumes/resume/${encodeURIComponent(r.id)}`}
                        aria-label={`Edit ${r.title}`}
                      >
                        <PencilIcon data-icon="inline-start" />
                        Edit
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
                )
              })}
            </div>
          )}
        </ListingTableCard>

        <AlertDialog
          open={deleteId !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteId(null)
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete resume?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes the saved resume from your list.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => {
                  if (deleteId) deleteResume(deleteId)
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
