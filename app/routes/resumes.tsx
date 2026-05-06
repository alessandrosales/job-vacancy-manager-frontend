import * as React from "react"
import { Link, useNavigate } from "react-router"

import { ListingPageHeader } from "~/components/listing/listing-page-header"
import { ListingTableCard } from "~/components/listing/listing-table-card"
import { ResumeImportPdfDialog } from "~/components/resumes/resume-import-pdf-dialog"
import { ResumeCompiledDownloadMenu } from "~/components/resumes/resume-compiled-download-menu"
import type {
  ResumeDocument,
  Role,
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
import { ApiError } from "~/lib/api/errors"
import {
  apiResumeToResumeDocument,
  deleteResume as deleteResumeApi,
  duplicateResume as duplicateResumeApi,
  listResumes,
} from "~/lib/api/resources/resumes"

import { listRoles } from "~/lib/api/resources/roles"
import { apiRoleToRole } from "~/lib/opportunity-api-mappers"
import {
  CopyIcon,
  FileUpIcon,
  Loader2Icon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"

function apiErrorText(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const base = err.fieldErrors.base?.[0]
    if (base) return base
    const firstField = Object.values(err.fieldErrors).flat()[0]
    if (firstField) return firstField
  }
  return fallback
}

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
  const parsed =
    isoDate.includes("T") || isoDate.endsWith("Z")
      ? Date.parse(isoDate)
      : Date.parse(`${isoDate}T12:00:00`)
  if (Number.isNaN(parsed)) return isoDate
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(parsed)
}

export default function ResumesPage() {
  const navigate = useNavigate()
  const [resumes, setResumes] = React.useState<ResumeDocument[]>([])
  const [roles, setRoles] = React.useState<Role[]>([])
  const [loadState, setLoadState] = React.useState<"idle" | "loading" | "error">(
    "loading"
  )
  const [listError, setListError] = React.useState<string | null>(null)

  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  const [deleteSubmitting, setDeleteSubmitting] = React.useState(false)
  const [deleteError, setDeleteError] = React.useState<string | null>(null)
  const [duplicatingId, setDuplicatingId] = React.useState<string | null>(null)

  const [searchQuery, setSearchQuery] = React.useState("")
  const searchNeedle = searchQuery.trim()

  const [importPdfOpen, setImportPdfOpen] = React.useState(false)

  const fetchAll = React.useCallback(async () => {
    setLoadState("loading")
    setListError(null)
    try {
      const [apiResumes, apiRoles] = await Promise.all([
        listResumes({ paginated: false }),
        listRoles({ paginated: false }),
      ])
      setResumes(apiResumes.map(apiResumeToResumeDocument))
      setRoles(apiRoles.map(apiRoleToRole))
      setLoadState("idle")
    } catch (e) {
      setLoadState("error")
      setListError(apiErrorText(e, "Could not load resumes."))
    }
  }, [])

  React.useEffect(() => {
    void fetchAll()
  }, [fetchAll])

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

  async function confirmDelete() {
    if (!deleteId) return
    setDeleteSubmitting(true)
    setDeleteError(null)
    try {
      await deleteResumeApi(deleteId)
      setResumes((prev) => prev.filter((r) => r.id !== deleteId))
      setDeleteId(null)
    } catch (e) {
      setDeleteError(apiErrorText(e, "Could not delete resume."))
    } finally {
      setDeleteSubmitting(false)
    }
  }

  async function duplicateResume(id: string) {
    setDuplicatingId(id)
    setListError(null)
    try {
      const api = await duplicateResumeApi(id)
      const doc = apiResumeToResumeDocument(api)
      setResumes((prev) => [doc, ...prev])
    } catch (e) {
      setListError(apiErrorText(e, "Could not duplicate resume."))
    } finally {
      setDuplicatingId(null)
    }
  }

  return (
    <AppLayout title="Resumes">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <ListingPageHeader
          title="Resumes"
          description="Saved CV versions — browse as cards and open one to edit."
          action={
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setImportPdfOpen(true)}
              >
                <FileUpIcon data-icon="inline-start" />
                Import PDF
              </Button>
              <Button asChild>
                <Link to="/resumes/resume">
                  <PlusIcon data-icon="inline-start" />
                  Add resume
                </Link>
              </Button>
            </div>
          }
        />

        {loadState === "error" ? (
          <p className="text-destructive px-1 text-sm" role="alert">
            {listError ?? "Could not load data."}{" "}
            <Button
              type="button"
              variant="link"
              className="text-destructive h-auto p-0 align-baseline underline"
              onClick={() => void fetchAll()}
            >
              Retry
            </Button>
          </p>
        ) : null}

        <ListingTableCard
          stats={
            loadState === "idle" && totalCount > 0
              ? searchNeedle
                ? `Showing ${shownCount} of ${totalCount}`
                : `${totalCount} saved`
              : undefined
          }
          searchValue={searchQuery}
          onSearchChange={setSearchQuery}
          searchPlaceholder="Search resumes…"
        >
          {loadState === "loading" ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              Loading resumes…
            </p>
          ) : resumes.length === 0 ? (
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
                    <CardFooter className="mt-auto flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive max-sm:size-9 max-sm:min-h-9 max-sm:min-w-9 max-sm:justify-center max-sm:gap-0 max-sm:!px-0 max-sm:!ps-0 max-sm:!pe-0"
                        aria-label={`Delete ${r.title}`}
                        onClick={() => setDeleteId(r.id)}
                      >
                        <Trash2Icon className="size-4 shrink-0" aria-hidden />
                        <span className="max-sm:sr-only">Delete</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="max-sm:size-9 max-sm:min-h-9 max-sm:min-w-9 max-sm:justify-center max-sm:gap-0 max-sm:!px-0 max-sm:!ps-0 max-sm:!pe-0"
                        aria-label={`Duplicate ${r.title}`}
                        disabled={duplicatingId !== null}
                        onClick={() => void duplicateResume(r.id)}
                      >
                        {duplicatingId === r.id ? (
                          <Loader2Icon className="size-4 shrink-0 animate-spin" aria-hidden />
                        ) : (
                          <CopyIcon className="size-4 shrink-0" aria-hidden />
                        )}
                        <span className="max-sm:sr-only">Duplicate</span>
                      </Button>
                      <ResumeCompiledDownloadMenu
                        resumeId={r.id}
                        resumeTitle={r.title}
                        compiledMarkdown={r.compiled_markdown}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="max-sm:size-9 max-sm:min-h-9 max-sm:min-w-9 max-sm:justify-center max-sm:gap-0 max-sm:!px-0 max-sm:!ps-0 max-sm:!pe-0"
                        asChild
                      >
                        <Link
                          to={`/resumes/resume/${encodeURIComponent(r.id)}`}
                          aria-label={`Edit ${r.title}`}
                        >
                          <PencilIcon className="size-4 shrink-0" aria-hidden />
                          <span className="max-sm:sr-only">Edit</span>
                        </Link>
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </ListingTableCard>

        <ResumeImportPdfDialog
          open={importPdfOpen}
          onOpenChange={setImportPdfOpen}
          roles={roles}
          onImported={async (api) => {
            const doc = apiResumeToResumeDocument(api)
            setResumes((prev) => {
              if (prev.some((r) => r.id === doc.id)) {
                return prev.map((r) => (r.id === doc.id ? doc : r))
              }
              return [doc, ...prev]
            })
            void fetchAll()
            navigate(`/resumes/resume/${encodeURIComponent(api.id)}`)
          }}
        />

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
              <AlertDialogTitle>Delete resume?</AlertDialogTitle>
              <AlertDialogDescription>
                This removes the saved resume from your list.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteError ? (
              <p className="text-destructive text-sm" role="alert">
                {deleteError}
              </p>
            ) : null}
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteSubmitting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={deleteSubmitting}
                onClick={() => void confirmDelete()}
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
