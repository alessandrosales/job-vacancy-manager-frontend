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
import { Textarea } from "~/components/ui/textarea"
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
  createOpportunityStatus,
  getOpportunityStatus,
  listOpportunityStatuses,
  updateOpportunityStatus,
  type ApiOpportunityStatusVariant,
} from "~/lib/api/resources/opportunity-statuses"

const BADGE_VARIANTS: ApiOpportunityStatusVariant[] = [
  "secondary",
  "outline",
  "default",
  "destructive",
]

function formErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const parts = [
      ...(err.fieldErrors.label ?? []),
      ...(err.fieldErrors.description ?? []),
      ...(err.fieldErrors.variant ?? []),
      ...(err.fieldErrors.position ?? []),
      ...(err.fieldErrors.base ?? []),
    ]
    if (parts.length > 0) return parts[0] ?? fallback
  }
  return fallback
}

export default function OpportunityStatusPage() {
  const { t } = useTranslation(pagesI18nNs)
  const { t: tc } = useTranslation("common")
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  const [label, setLabel] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [variant, setVariant] =
    React.useState<ApiOpportunityStatusVariant>("secondary")
  const [postSaveOpen, setPostSaveOpen] = React.useState(false)
  const [loadState, setLoadState] = React.useState<"idle" | "loading">(
    isEdit ? "loading" : "idle"
  )
  const [nextPosition, setNextPosition] = React.useState(0)
  const [positionReady, setPositionReady] = React.useState(isEdit)
  const [submitting, setSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (isEdit) return

    let cancelled = false
    setPositionReady(false)
    void listOpportunityStatuses({ paginated: false })
      .then((rows) => {
        if (cancelled) return
        const max = rows.reduce((m, r) => Math.max(m, r.position ?? 0), -1)
        setNextPosition(max + 1)
        setPositionReady(true)
      })
      .catch(() => {
        if (!cancelled) {
          setNextPosition(0)
          setPositionReady(true)
        }
      })

    return () => {
      cancelled = true
    }
  }, [isEdit])

  React.useEffect(() => {
    if (!isEdit || !id) {
      setLoadState("idle")
      return
    }

    let cancelled = false
    setLoadState("loading")
    void getOpportunityStatus(id)
      .then((row) => {
        if (cancelled) return
        setLabel(row.label)
        setDescription(row.description ?? "")
        setVariant(row.variant)
        setLoadState("idle")
      })
      .catch(() => {
        if (!cancelled) navigate("/opportunities/statuses", { replace: true })
      })

    return () => {
      cancelled = true
    }
  }, [isEdit, id, navigate])

  function resetForm() {
    setLabel("")
    setDescription("")
    setVariant("secondary")
    setFormError(null)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    setFormError(null)
    const labelTrim = label.trim()
    if (!labelTrim) return

    const descriptionValue =
      description.trim() === "" ? null : description.trim()

    setSubmitting(true)
    try {
      if (isEdit && id) {
        await updateOpportunityStatus(id, {
          label: labelTrim,
          description: descriptionValue,
          variant,
        })
        navigate("/opportunities/statuses")
      } else {
        await createOpportunityStatus({
          label: labelTrim,
          description: descriptionValue,
          variant,
          position: nextPosition,
        })
        setPostSaveOpen(true)
      }
    } catch (err) {
      setFormError(formErrorMessage(err, t("opportunity_status.form_error")))
    } finally {
      setSubmitting(false)
    }
  }

  const title = isEdit
    ? t("opportunity_status.edit_title")
    : t("opportunity_status.new_title")
  const crumbAction = isEdit ? t("shared.crumb_edit") : t("shared.crumb_new")
  const breadcrumbs = [
    { label: tc("breadcrumb_dashboard"), to: "/dashboard" },
    { label: tc("nav_opportunities"), to: "/opportunities" },
    {
      label: t("opportunity_status.crumb_statuses"),
      to: "/opportunities/statuses",
    },
    { label: crumbAction },
  ]

  if (isEdit && loadState === "loading") {
    return (
      <AppLayout
        title={t("opportunity_status.edit_title")}
        breadcrumbs={breadcrumbs}
      >
        <p className="text-muted-foreground">
          {t("opportunity_status.load_loading")}
        </p>
      </AppLayout>
    )
  }

  const saveDisabled = submitting || (!isEdit && !positionReady)

  return (
    <AppLayout title={title} breadcrumbs={breadcrumbs}>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>
              {isEdit
                ? t("opportunity_status.card_desc_edit")
                : t("opportunity_status.card_desc_new")}
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
                  <FieldLabel htmlFor="os-label">
                    {t("opportunity_status.field_label")}
                  </FieldLabel>
                  <Input
                    id="os-label"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    required
                    disabled={submitting}
                    placeholder={t("opportunity_status.placeholder_label")}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="os-description">
                    {t("opportunity_status.field_description")}
                  </FieldLabel>
                  <Textarea
                    id="os-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={t(
                      "opportunity_status.placeholder_description"
                    )}
                    rows={3}
                    disabled={submitting}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="os-variant">
                    {t("opportunity_status.badge_style")}
                  </FieldLabel>
                  <Select
                    value={variant}
                    onValueChange={(v) =>
                      setVariant(v as ApiOpportunityStatusVariant)
                    }
                    disabled={submitting}
                  >
                    <SelectTrigger id="os-variant" className="w-full min-w-0">
                      <SelectValue
                        placeholder={t("opportunity_status.placeholder_style")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {BADGE_VARIANTS.map((v) => (
                          <SelectItem key={v} value={v}>
                            {v}
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
              <Button type="submit" disabled={saveDisabled}>
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
        entityLabel={t("entity.status")}
        onGoToList={() => navigate("/opportunities/statuses")}
        onAddAnother={() => {
          setPostSaveOpen(false)
          resetForm()
          void listOpportunityStatuses({ paginated: false }).then((rows) => {
            const max = rows.reduce((m, r) => Math.max(m, r.position ?? 0), -1)
            setNextPosition(max + 1)
          })
        }}
      />
    </AppLayout>
  )
}
