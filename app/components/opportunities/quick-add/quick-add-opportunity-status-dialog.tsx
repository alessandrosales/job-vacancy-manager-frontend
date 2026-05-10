"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"

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
import { Textarea } from "~/components/ui/textarea"
import { createOpportunityStatus } from "~/lib/api/resources/opportunity-statuses"
import type {
  OpportunityStatusDefinition,
  StatusBadgeVariant,
} from "~/lib/labels"
import { pagesI18nNs } from "~/lib/i18n/config"

const BADGE_VARIANTS: StatusBadgeVariant[] = [
  "secondary",
  "outline",
  "default",
  "destructive",
]

export function QuickAddOpportunityStatusDialog({
  open,
  onOpenChange,
  onAdded,
  persistViaApi = false,
  onPersistedViaApi,
}: QuickAddRelationDialogProps) {
  const { t } = useTranslation(pagesI18nNs)
  const { addOpportunityStatus } = useAppData()
  const [label, setLabel] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [variant, setVariant] = React.useState<StatusBadgeVariant>("secondary")
  const [submitting, setSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    setLabel("")
    setDescription("")
    setVariant("secondary")
    setFormError(null)
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedLabel = label.trim()
    if (!trimmedLabel) return

    if (persistViaApi) {
      setFormError(null)
      setSubmitting(true)
      try {
        const created = await createOpportunityStatus({
          label: trimmedLabel,
          description: description.trim() === "" ? null : description.trim(),
          variant,
        })
        onAdded(created.id)
        await onPersistedViaApi?.()
        onOpenChange(false)
      } catch (err) {
        setFormError(
          apiFormErrorFromUnknown(
            err,
            t("opportunities.quick_add_create_status_error")
          )
        )
      } finally {
        setSubmitting(false)
      }
      return
    }

    const row: Omit<OpportunityStatusDefinition, "id"> = {
      label: trimmedLabel,
      description: description.trim() || undefined,
      variant,
    }
    const id = addOpportunityStatus(row)
    onAdded(id)
    onOpenChange(false)
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
            <DialogTitle>{t("opportunities.new_status")}</DialogTitle>
            <DialogDescription>
              {t("opportunities.quick_add_status_pipeline_desc")}
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
                <FieldLabel htmlFor="qas-label">{t("shared.label")}</FieldLabel>
                <Input
                  id="qas-label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  required
                  autoFocus
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
                  rows={2}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="qas-variant">
                  {t("opportunity_status.badge_style")}
                </FieldLabel>
                <Select
                  value={variant}
                  onValueChange={(v) => setVariant(v as StatusBadgeVariant)}
                >
                  <SelectTrigger id="qas-variant" className="w-full min-w-0">
                    <SelectValue />
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
