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
import { Textarea } from "~/components/ui/textarea"
import { createSkill } from "~/lib/api/resources/skills"
import { pagesI18nNs } from "~/lib/i18n/config"

export function QuickAddSkillDialog({
  open,
  onOpenChange,
  onAdded,
  onPersistedViaApi,
}: QuickAddRelationDialogProps) {
  const { t } = useTranslation(pagesI18nNs)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    setName("")
    setDescription("")
    setFormError(null)
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return

    setFormError(null)
    setSubmitting(true)
    try {
      const created = await createSkill({
        name: trimmedName,
        description: description.trim() === "" ? null : description.trim(),
      })
      onAdded(created.id)
      await onPersistedViaApi?.()
      onOpenChange(false)
    } catch (err) {
      setFormError(
        apiFormErrorFromUnknown(err, t("resume.quick_add_create_skill_error"))
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
            <DialogTitle>{t("skill.new_title")}</DialogTitle>
            <DialogDescription>
              {t("resume.quick_add_skill_desc")}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[min(70vh,420px)] overflow-y-auto px-4 pt-2 pb-6">
            <FieldGroup>
              {formError ? (
                <p role="alert" className="text-sm text-destructive">
                  {formError}
                </p>
              ) : null}
              <Field>
                <FieldLabel htmlFor="qas-name">{t("shared.name")}</FieldLabel>
                <Input
                  id="qas-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  disabled={submitting}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="qas-desc">
                  {t("shared.description")}
                </FieldLabel>
                <Textarea
                  id="qas-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder={t("shared.optional")}
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
