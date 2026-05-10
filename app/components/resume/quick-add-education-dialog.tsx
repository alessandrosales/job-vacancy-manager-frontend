"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"

import { apiFormErrorFromUnknown } from "~/components/opportunities/quick-add/api-form-error"
import type { QuickAddRelationDialogProps } from "~/components/opportunities/quick-add/types"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { Field, FieldGroup, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { createEducation } from "~/lib/api/resources/educations"
import { pagesI18nNs } from "~/lib/i18n/config"

function emptyToNull(s: string): string | null {
  const t = s.trim()
  return t === "" ? null : t
}

export function QuickAddEducationDialog({
  open,
  onOpenChange,
  onAdded,
  onPersistedViaApi,
}: QuickAddRelationDialogProps) {
  const { t } = useTranslation(pagesI18nNs)
  const [institutionName, setInstitutionName] = React.useState("")
  const [degree, setDegree] = React.useState("")
  const [fieldOfStudy, setFieldOfStudy] = React.useState("")
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    setInstitutionName("")
    setDegree("")
    setFieldOfStudy("")
    setDateFrom("")
    setDateTo("")
    setFormError(null)
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const inst = institutionName.trim()
    if (!inst) return

    setFormError(null)
    setSubmitting(true)
    try {
      const created = await createEducation({
        institution_name: inst,
        degree: emptyToNull(degree),
        field_of_study: emptyToNull(fieldOfStudy),
        date_from: emptyToNull(dateFrom),
        date_to: emptyToNull(dateTo),
      })
      onAdded(created.id)
      await onPersistedViaApi?.()
      onOpenChange(false)
    } catch (err) {
      setFormError(
        apiFormErrorFromUnknown(
          err,
          t("resume.quick_add_create_education_error")
        )
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-md overflow-hidden p-0 sm:max-w-md"
        showCloseButton
      >
        <form
          onSubmit={(ev) => void handleSubmit(ev)}
          className="flex flex-col"
        >
          <DialogHeader className="shrink-0 px-4 pt-4 pb-2">
            <DialogTitle>{t("education.new_title")}</DialogTitle>
            <DialogDescription>
              {t("resume.quick_add_edu_desc")}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[min(70vh,520px)] overflow-y-auto px-4 pt-2 pb-6">
            <FieldGroup>
              {formError ? (
                <p role="alert" className="text-sm text-destructive">
                  {formError}
                </p>
              ) : null}
              <Field>
                <FieldLabel htmlFor="qae-inst">
                  {t("education.institution_name")}
                </FieldLabel>
                <Input
                  id="qae-inst"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  required
                  autoFocus
                  disabled={submitting}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="qae-degree">
                  {t("shared.degree")}
                </FieldLabel>
                <Input
                  id="qae-degree"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder={t("shared.optional")}
                  disabled={submitting}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="qae-field">
                  {t("shared.field_of_study")}
                </FieldLabel>
                <Input
                  id="qae-field"
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  placeholder={t("shared.optional")}
                  disabled={submitting}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="qae-from">
                  {t("certification.date_from")}
                </FieldLabel>
                <Input
                  id="qae-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  disabled={submitting}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="qae-to">
                  {t("certification.date_to")}
                </FieldLabel>
                <Input
                  id="qae-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  disabled={submitting}
                />
              </Field>
            </FieldGroup>
          </div>
          <DialogFooter className="mx-0 mb-0 shrink-0 rounded-b-xl border-t bg-muted/30 px-4 pt-3 pb-5 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              {t("shared.cancel")}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t("shared.saving") : t("shared.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
