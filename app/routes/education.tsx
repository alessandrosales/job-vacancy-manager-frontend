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
  createEducation,
  getEducation,
  updateEducation,
} from "~/lib/api/resources/educations"

function emptyToNull(s: string): string | null {
  const t = s.trim()
  return t === "" ? null : t
}

function formErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const parts = [
      ...(err.fieldErrors.institution_name ?? []),
      ...(err.fieldErrors.degree ?? []),
      ...(err.fieldErrors.field_of_study ?? []),
      ...(err.fieldErrors.date_from ?? []),
      ...(err.fieldErrors.date_to ?? []),
      ...(err.fieldErrors.base ?? []),
    ]
    if (parts.length > 0) return parts[0] ?? "Could not save education."
  }
  return "Could not save education."
}

export default function EducationPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [institutionName, setInstitutionName] = React.useState("")
  const [degree, setDegree] = React.useState("")
  const [fieldOfStudy, setFieldOfStudy] = React.useState("")
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
    void getEducation(id)
      .then((row) => {
        if (cancelled) return
        setInstitutionName(row.institution_name)
        setDegree(row.degree ?? "")
        setFieldOfStudy(row.field_of_study ?? "")
        setDateFrom(row.date_from ?? "")
        setDateTo(row.date_to ?? "")
        setLoadState("idle")
      })
      .catch(() => {
        if (!cancelled) navigate("/educations", { replace: true })
      })

    return () => {
      cancelled = true
    }
  }, [isEdit, id, navigate])

  function resetForm() {
    setInstitutionName("")
    setDegree("")
    setFieldOfStudy("")
    setDateFrom("")
    setDateTo("")
    setFormError(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    setFormError(null)

    const payload = {
      institution_name: institutionName.trim(),
      degree: emptyToNull(degree),
      field_of_study: emptyToNull(fieldOfStudy),
      date_from: emptyToNull(dateFrom),
      date_to: emptyToNull(dateTo),
    }

    setSubmitting(true)
    try {
      if (isEdit && id) {
        await updateEducation(id, payload)
        navigate("/educations")
      } else {
        await createEducation(payload)
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
        title="Edit education"
        breadcrumbs={[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Education", to: "/educations" },
          { label: "Edit" },
        ]}
      >
        <p className="text-muted-foreground">Loading education…</p>
      </AppLayout>
    )
  }

  const pageTitle = isEdit ? "Edit education" : "New education"
  const crumbAction = isEdit ? "Edit" : "New"

  return (
    <AppLayout
      title={pageTitle}
      breadcrumbs={[
        { label: "Dashboard", to: "/dashboard" },
        { label: "Education", to: "/educations" },
        { label: crumbAction },
      ]}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>{pageTitle}</CardTitle>
            <CardDescription>
              {isEdit
                ? "Update this academic entry."
                : "Add a degree or program you completed."}
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
                  <FieldLabel htmlFor="edu-inst">Institution name</FieldLabel>
                  <Input
                    id="edu-inst"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edu-degree">Degree</FieldLabel>
                  <Input
                    id="edu-degree"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    disabled={submitting}
                    placeholder="Optional"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edu-field">Field of study</FieldLabel>
                  <Input
                    id="edu-field"
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    disabled={submitting}
                    placeholder="Optional"
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edu-from">Date from</FieldLabel>
                  <Input
                    id="edu-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    disabled={submitting}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edu-to">Date to</FieldLabel>
                  <Input
                    id="edu-to"
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
        entityLabel="Education"
        onGoToList={() => navigate("/educations")}
        onAddAnother={() => {
          setPostSaveOpen(false)
          resetForm()
        }}
      />
    </AppLayout>
  )
}
