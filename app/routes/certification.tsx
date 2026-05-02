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
  createCertification,
  getCertification,
  updateCertification,
} from "~/lib/api/resources/certifications"

function emptyToNull(s: string): string | null {
  const t = s.trim()
  return t === "" ? null : t
}

function formErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const parts = [
      ...(err.fieldErrors.name ?? []),
      ...(err.fieldErrors.date_from ?? []),
      ...(err.fieldErrors.date_to ?? []),
      ...(err.fieldErrors.base ?? []),
    ]
    if (parts.length > 0) return parts[0] ?? "Could not save certification."
  }
  return "Could not save certification."
}

export default function CertificationPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [name, setName] = React.useState("")
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
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
    void getCertification(id)
      .then((row) => {
        if (cancelled) return
        setName(row.name)
        setDateFrom(row.date_from ?? "")
        setDateTo(row.date_to ?? "")
        setLoadState("idle")
      })
      .catch(() => {
        if (!cancelled) navigate("/certifications", { replace: true })
      })

    return () => {
      cancelled = true
    }
  }, [isEdit, id, navigate])

  function resetForm() {
    setName("")
    setDateFrom("")
    setDateTo("")
    setFormError(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    setFormError(null)

    const payload = {
      name: name.trim(),
      date_from: emptyToNull(dateFrom),
      date_to: emptyToNull(dateTo),
    }

    setSubmitting(true)
    try {
      if (isEdit && id) {
        await updateCertification(id, payload)
        navigate("/certifications")
      } else {
        await createCertification(payload)
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
        title="Edit certification"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Certifications", to: "/certifications" },
          { label: "Edit" },
        ]}
      >
        <p className="text-muted-foreground">Loading certification…</p>
      </AppLayout>
    )
  }

  const pageTitle = isEdit ? "Edit certification" : "New certification"
  const crumbAction = isEdit ? "Edit" : "New"

  return (
    <AppLayout
      title={pageTitle}
      breadcrumbs={[
        { label: "Dashboard", to: "/dashboard" },
        { label: "Certifications", to: "/certifications" },
        { label: crumbAction },
      ]}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>{pageTitle}</CardTitle>
            <CardDescription>
              {isEdit
                ? "Update this certification."
                : "Add a certification or license you hold."}
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
                  <FieldLabel htmlFor="cert-name">Name</FieldLabel>
                  <Input
                    id="cert-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="cert-from">Date from</FieldLabel>
                  <Input
                    id="cert-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    disabled={submitting}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="cert-to">Date to</FieldLabel>
                  <Input
                    id="cert-to"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
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
        entityLabel="Certification"
        onGoToList={() => navigate("/certifications")}
        onAddAnother={() => {
          setPostSaveOpen(false)
          resetForm()
        }}
      />
    </AppLayout>
  )
}
