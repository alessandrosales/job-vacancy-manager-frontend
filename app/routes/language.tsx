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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { PostSaveDialog } from "~/components/shared/post-save-dialog"
import { ApiError } from "~/lib/api/errors"
import { pagesI18nNs } from "~/lib/i18n/config"
import {
  createLanguage,
  getLanguage,
  updateLanguage,
  type LanguageLevel,
} from "~/lib/api/resources/languages"

const LANGUAGE_LEVEL_VALUES: LanguageLevel[] = [
  "beginner",
  "intermediate",
  "advanced",
  "native",
]

function formErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const parts = [
      ...(err.fieldErrors.name ?? []),
      ...(err.fieldErrors.level ?? []),
      ...(err.fieldErrors.base ?? []),
    ]
    if (parts.length > 0) return parts[0] ?? fallback
  }
  return fallback
}

export default function LanguagePage() {
  const { t } = useTranslation(pagesI18nNs)
  const { t: tc } = useTranslation("common")
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [name, setName] = React.useState("")
  const [level, setLevel] = React.useState<LanguageLevel>("intermediate")
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
    void getLanguage(id)
      .then((row) => {
        if (cancelled) return
        setName(row.name)
        setLevel(row.level)
        setLoadState("idle")
      })
      .catch(() => {
        if (!cancelled) navigate("/languages", { replace: true })
      })

    return () => {
      cancelled = true
    }
  }, [isEdit, id, navigate])

  function resetForm() {
    setName("")
    setLevel("intermediate")
    setFormError(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    setFormError(null)
    const nameTrim = name.trim()

    setSubmitting(true)
    try {
      if (isEdit && id) {
        await updateLanguage(id, {
          name: nameTrim,
          level,
        })
        navigate("/languages")
      } else {
        await createLanguage({
          name: nameTrim,
          level,
        })
        setPostSaveOpen(true)
      }
    } catch (err) {
      setFormError(formErrorMessage(err, t("language.form_error")))
    } finally {
      setSubmitting(false)
    }
  }

  const pageTitle = isEdit ? t("language.edit_title") : t("language.new_title")
  const crumbAction = isEdit ? t("shared.crumb_edit") : t("shared.crumb_new")
  const breadcrumbs = [
    { label: tc("breadcrumb_dashboard"), to: "/dashboard" },
    { label: tc("nav_languages"), to: "/languages" },
    { label: crumbAction },
  ]

  if (isEdit && loadState === "loading") {
    return (
      <AppLayout title={t("language.edit_title")} breadcrumbs={breadcrumbs}>
        <p className="text-muted-foreground">{t("language.load_loading")}</p>
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
                ? t("language.card_desc_edit")
                : t("language.card_desc_new")}
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
                  <FieldLabel htmlFor="lang-name">
                    {t("shared.name")}
                  </FieldLabel>
                  <Input
                    id="lang-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("language.placeholder_name")}
                    required
                    disabled={submitting}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="lang-level">
                    {t("language.proficiency")}
                  </FieldLabel>
                  <Select
                    value={level}
                    onValueChange={(v) => setLevel(v as LanguageLevel)}
                    disabled={submitting}
                  >
                    <SelectTrigger id="lang-level" className="w-full">
                      <SelectValue
                        placeholder={t("language.placeholder_level")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {LANGUAGE_LEVEL_VALUES.map((value) => (
                          <SelectItem key={value} value={value}>
                            {t(`language_level.${value}`)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
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
        entityLabel={t("entity.language")}
        onGoToList={() => navigate("/languages")}
        onAddAnother={() => {
          setPostSaveOpen(false)
          resetForm()
        }}
      />
    </AppLayout>
  )
}
