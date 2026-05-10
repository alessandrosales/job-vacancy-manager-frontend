"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
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
import { Field, FieldGroup, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { PostSaveDialog } from "~/components/shared/post-save-dialog"
import { ApiError } from "~/lib/api/errors"
import { pagesI18nNs } from "~/lib/i18n/config"
import {
  createEducation,
  getEducation,
  updateEducation,
} from "~/lib/api/resources/educations"

function emptyToNull(s: string): string | null {
  const trimmed = s.trim()
  return trimmed === "" ? null : trimmed
}

function formErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const parts = [
      ...(err.fieldErrors.institution_name ?? []),
      ...(err.fieldErrors.degree ?? []),
      ...(err.fieldErrors.field_of_study ?? []),
      ...(err.fieldErrors.date_from ?? []),
      ...(err.fieldErrors.date_to ?? []),
      ...(err.fieldErrors.base ?? []),
    ]
    if (parts.length > 0) return parts[0] ?? fallback
  }
  return fallback
}

export default function EducationPage() {
  const { t } = useTranslation(pagesI18nNs)
  const { t: tc } = useTranslation("common")
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
      setFormError(formErrorMessage(err, t("education.form_error")))
    } finally {
      setSubmitting(false)
    }
  }

  const pageTitle = isEdit
    ? t("education.edit_title")
    : t("education.new_title")
  const crumbAction = isEdit ? t("shared.crumb_edit") : t("shared.crumb_new")
  const breadcrumbs = [
    { label: tc("breadcrumb_dashboard"), to: "/dashboard" },
    { label: tc("nav_education"), to: "/educations" },
    { label: crumbAction },
  ]

  if (isEdit && loadState === "loading") {
    return (
      <AppLayout title={t("education.edit_title")} breadcrumbs={breadcrumbs}>
        <p className="text-muted-foreground">{t("education.load_loading")}</p>
      </AppLayout>
    )
  }

  return (
    <AppLayout title={pageTitle} breadcrumbs={breadcrumbs}>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>{pageTitle}</CardTitle>
            <CardDescription>
              {isEdit
                ? t("education.card_desc_edit")
                : t("education.card_desc_new")}
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
                  <FieldLabel htmlFor="edu-inst">
                    {t("education.institution_name")}
                  </FieldLabel>
                  <Input
                    id="edu-inst"
                    value={institutionName}
                    onChange={(e) => setInstitutionName(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edu-degree">
                    {t("shared.degree")}
                  </FieldLabel>
                  <Input
                    id="edu-degree"
                    value={degree}
                    onChange={(e) => setDegree(e.target.value)}
                    disabled={submitting}
                    placeholder={t("shared.optional")}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edu-field">
                    {t("shared.field_of_study")}
                  </FieldLabel>
                  <Input
                    id="edu-field"
                    value={fieldOfStudy}
                    onChange={(e) => setFieldOfStudy(e.target.value)}
                    disabled={submitting}
                    placeholder={t("shared.optional")}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edu-from">{t("shared.from")}</FieldLabel>
                  <Input
                    id="edu-from"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    disabled={submitting}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="edu-to">{t("shared.to")}</FieldLabel>
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
                {t("shared.cancel")}
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? t("shared.saving")
                  : isEdit
                    ? t("shared.save_changes")
                    : t("shared.save")}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      <PostSaveDialog
        open={postSaveOpen}
        entityLabel={t("entity.education")}
        onGoToList={() => navigate("/educations")}
        onAddAnother={() => {
          setPostSaveOpen(false)
          resetForm()
        }}
      />
    </AppLayout>
  )
}
