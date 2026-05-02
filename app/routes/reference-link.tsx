import * as React from "react"
import { useNavigate, useParams } from "react-router"

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
  Field,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { PostSaveDialog } from "~/components/shared/post-save-dialog"
import { ApiError } from "~/lib/api/errors"
import {
  createReferenceLink,
  getReferenceLink,
  updateReferenceLink,
} from "~/lib/api/resources/reference-links"

function normalizeUrlForApi(raw: string): string {
  const t = raw.trim()
  if (!t) return t
  if (/^https?:\/\//i.test(t)) return t
  return `https://${t}`
}

function formErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const parts = [
      ...(err.fieldErrors.title ?? []),
      ...(err.fieldErrors.url ?? []),
      ...(err.fieldErrors.base ?? []),
    ]
    if (parts.length > 0) return parts[0] ?? "Could not save link."
  }
  return "Could not save link."
}

export default function ReferenceLinkPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [title, setTitle] = React.useState("")
  const [url, setUrl] = React.useState("")
  const [postSaveOpen, setPostSaveOpen] = React.useState(false)
  const [loadState, setLoadState] = React.useState<"idle" | "loading">(
    isEdit ? "loading" : "idle"
  )
  const [submitting, setSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!isEdit || !id) {
      setLoadState("idle")
      return
    }

    let cancelled = false
    setLoadState("loading")
    void getReferenceLink(id)
      .then((row) => {
        if (cancelled) return
        setTitle(row.title)
        setUrl(row.url)
        setLoadState("idle")
      })
      .catch(() => {
        if (!cancelled) navigate("/links", { replace: true })
      })

    return () => {
      cancelled = true
    }
  }, [isEdit, id, navigate])

  function resetForm() {
    setTitle("")
    setUrl("")
    setFormError(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    setFormError(null)
    const titleTrim = title.trim()
    const urlNormalized = normalizeUrlForApi(url)

    setSubmitting(true)
    try {
      if (isEdit && id) {
        await updateReferenceLink(id, {
          title: titleTrim,
          url: urlNormalized,
        })
        navigate("/links")
      } else {
        await createReferenceLink({
          title: titleTrim,
          url: urlNormalized,
        })
        setPostSaveOpen(true)
      }
    } catch (err) {
      setFormError(formErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (isEdit && loadState === "loading") {
    return (
      <AppLayout
        title="Edit link"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Links", to: "/links" },
          { label: "Edit" },
        ]}
      >
        <p className="text-muted-foreground">Loading link…</p>
      </AppLayout>
    )
  }

  const pageTitle = isEdit ? "Edit link" : "New link"
  const crumbAction = isEdit ? "Edit" : "New"

  return (
    <AppLayout
      title={pageTitle}
      breadcrumbs={[
        { label: "Dashboard", to: "/dashboard" },
        { label: "Links", to: "/links" },
        { label: crumbAction },
      ]}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>{pageTitle}</CardTitle>
            <CardDescription>
              {isEdit
                ? "Update this reference link."
                : "Save a title and URL for quick access from your sidebar area."}
            </CardDescription>
          </CardHeader>
          <form
            onSubmit={(e) => void handleSubmit(e)}
            className="flex flex-col gap-4"
          >
            <CardContent>
              <FieldGroup>
                {formError ? (
                  <p className="text-sm text-destructive" role="alert">
                    {formError}
                  </p>
                ) : null}
                <Field>
                  <FieldLabel htmlFor="ref-link-title">Title</FieldLabel>
                  <Input
                    id="ref-link-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="ref-link-url">URL</FieldLabel>
                  <Input
                    id="ref-link-url"
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https:// or domain.com"
                    required
                    disabled={submitting}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
            <CardFooter className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={submitting}
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? "Saving…"
                  : isEdit
                    ? "Save changes"
                    : "Save"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      <PostSaveDialog
        open={postSaveOpen}
        entityLabel="Link"
        onGoToList={() => navigate("/links")}
        onAddAnother={() => {
          setPostSaveOpen(false)
          resetForm()
        }}
      />
    </AppLayout>
  )
}
