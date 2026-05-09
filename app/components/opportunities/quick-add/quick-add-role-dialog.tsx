"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"

import { InterestLevelStarPicker } from "~/components/shared/interest-level-star-picker"
import { apiFormErrorFromUnknown } from "~/components/opportunities/quick-add/api-form-error"
import type { QuickAddRelationDialogProps } from "~/components/opportunities/quick-add/types"
import { useAppData } from "~/components/providers/app-data-provider"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { createRole } from "~/lib/api/resources/roles"
import type { InterestLevel } from "~/lib/labels"
import { pagesI18nNs } from "~/lib/i18n/config"

export function QuickAddRoleDialog({
  open,
  onOpenChange,
  onAdded,
  persistViaApi = false,
  onPersistedViaApi,
}: QuickAddRelationDialogProps) {
  const { t } = useTranslation(pagesI18nNs)
  const { addRole } = useAppData()
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [interestLevel, setInterestLevel] = React.useState<InterestLevel>(3)
  const [submitting, setSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    setName("")
    setDescription("")
    setInterestLevel(3)
    setFormError(null)
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return

    if (persistViaApi) {
      setFormError(null)
      setSubmitting(true)
      try {
        const created = await createRole({
          name: trimmedName,
          description: description.trim() === "" ? null : description.trim(),
          interest_level: interestLevel,
        })
        onAdded(created.id)
        await onPersistedViaApi?.()
        onOpenChange(false)
      } catch (err) {
        setFormError(
          apiFormErrorFromUnknown(err, t("opportunities.quick_add_create_role_error"))
        )
      } finally {
        setSubmitting(false)
      }
      return
    }

    const id = addRole({
      name: trimmedName,
      description: description.trim(),
      interest_level: interestLevel,
    })
    onAdded(id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden p-0 sm:max-w-md" showCloseButton>
        <form onSubmit={(ev) => void handleSubmit(ev)} className="flex flex-col">
          <DialogHeader className="shrink-0 px-4 pt-4 pb-2">
            <DialogTitle>{t("role.new_title")}</DialogTitle>
            <DialogDescription>{t("opportunities.quick_add_role_desc")}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[min(70vh,420px)] overflow-y-auto px-4 pt-2 pb-6">
            <FieldGroup>
              {formError ? (
                <p role="alert" className="text-destructive text-sm">
                  {formError}
                </p>
              ) : null}
              <Field>
                <FieldLabel htmlFor="qar-name">{t("shared.name")}</FieldLabel>
                <Input
                  id="qar-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="qar-desc">{t("shared.description")}</FieldLabel>
                <Textarea
                  id="qar-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </Field>
              <Field>
                <FieldLabel>{t("shared.interest_level")}</FieldLabel>
                <InterestLevelStarPicker
                  value={interestLevel}
                  onChange={setInterestLevel}
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
