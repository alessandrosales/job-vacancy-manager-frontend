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
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { PostSaveDialog } from "~/components/shared/post-save-dialog"
import { ApiError } from "~/lib/api/errors"
import { pagesI18nNs } from "~/lib/i18n/config"
import {
  createReferenceLink,
  getReferenceLink,
  updateReferenceLink,
} from "~/lib/api/resources/reference-links"

function normalizeUrlForApi(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) return trimmed
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

function formErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const parts = [
      ...(err.fieldErrors.title ?? []),
      ...(err.fieldErrors.url ?? []),
      ...(err.fieldErrors.base ?? []),
    ]
    if (parts.length > 0) return parts[0] ?? fallback
  }
  return fallback
}

export default function ReferenceLinkPage() {
  const { t } = useTranslation(pagesI18nNs)
  const { t: tc } = useTranslation("common")
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
      setFormError(formErrorMessage(err, t("reference_link.form_error")))
    } finally {
      setSubmitting(false)
    }
  }

  const pageTitle = isEdit ? t("reference_link.edit_title") : t("reference_link.new_title")
  const crumbAction = isEdit ? t("shared.crumb_edit") : t("shared.crumb_new")
  const breadcrumbs = [
    { label: tc("breadcrumb_dashboard"), to: "/dashboard" },
    { label: tc("nav_links"), to: "/links" },
    { label: crumbAction },
  ]

  if (isEdit && loadState === "loading") {
    return (
      <AppLayout title={t("reference_link.edit_title")} breadcrumbs={breadcrumbs}>
        <p className="text-muted-foreground">{t("reference_link.load_loading")}</p>
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
              {isEdit ? t("reference_link.card_desc_edit") : t("reference_link.card_desc_new")}
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
                  <FieldLabel htmlFor="ref-link-title">{t("reference_link.field_title")}</FieldLabel>
                  <Input
                    id="ref-link-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    disabled={submitting}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="ref-link-url">{t("shared.url")}</FieldLabel>
                  <Input
                    id="ref-link-url"
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder={t("reference_link.url_placeholder")}
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
                {t("shared.cancel")}
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? t("shared.saving") : isEdit ? t("shared.save_changes") : t("shared.save")}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      <PostSaveDialog
        open={postSaveOpen}
        entityLabel={t("entity.link")}
        onGoToList={() => navigate("/links")}
        onAddAnother={() => {
          setPostSaveOpen(false)
          resetForm()
        }}
      />
    </AppLayout>
  )
}
