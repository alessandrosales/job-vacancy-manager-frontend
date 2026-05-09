"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"

import { apiFormErrorFromUnknown } from "~/components/opportunities/quick-add/api-form-error"
import type { QuickAddRelationDialogProps } from "~/components/opportunities/quick-add/types"
import {
  WorkExperienceSkillFieldset,
  type WorkExperienceSkillPickerRow,
} from "~/components/work-experience/work-experience-skill-fieldset"
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
import { Switch } from "~/components/ui/switch"
import { Textarea } from "~/components/ui/textarea"
import {
  createWorkExperience,
  syncWorkExperienceSkills,
} from "~/lib/api/resources/work-experiences"
import { pagesI18nNs } from "~/lib/i18n/config"

function emptyToNull(s: string): string | null {
  const t = s.trim()
  return t === "" ? null : t
}

export type QuickAddWorkExperienceDialogProps = QuickAddRelationDialogProps & {
  skills: readonly WorkExperienceSkillPickerRow[]
  onEmptySkillsAddNew?: () => void
  emptySkillsMessage?: string
  emptySkillsHint?: string
}

export function QuickAddWorkExperienceDialog({
  open,
  onOpenChange,
  onAdded,
  onPersistedViaApi,
  skills,
  onEmptySkillsAddNew,
  emptySkillsMessage,
  emptySkillsHint,
}: QuickAddWorkExperienceDialogProps) {
  const { t } = useTranslation(pagesI18nNs)
  const [title, setTitle] = React.useState("")
  const [companyName, setCompanyName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [isRemote, setIsRemote] = React.useState(false)
  const [dateFrom, setDateFrom] = React.useState("")
  const [dateTo, setDateTo] = React.useState("")
  const [skillIds, setSkillIds] = React.useState<string[]>([])
  const [submitting, setSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) return
    setTitle("")
    setCompanyName("")
    setDescription("")
    setIsRemote(false)
    setDateFrom("")
    setDateTo("")
    setSkillIds([])
    setFormError(null)
  }, [open])

  function validSkillIds(): string[] {
    const allowed = new Set(skills.map((s) => s.id))
    return skillIds.filter((sid) => allowed.has(sid))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedTitle = title.trim()
    const trimmedCompany = companyName.trim()
    if (!trimmedTitle || !trimmedCompany) return

    setFormError(null)
    setSubmitting(true)
    try {
      const created = await createWorkExperience({
        title: trimmedTitle,
        company_name: trimmedCompany,
        description: emptyToNull(description),
        is_remote: isRemote,
        date_from: emptyToNull(dateFrom),
        date_to: emptyToNull(dateTo),
      })
      await syncWorkExperienceSkills(created.id, validSkillIds())
      onAdded(created.id)
      await onPersistedViaApi?.()
      onOpenChange(false)
    } catch (err) {
      setFormError(
        apiFormErrorFromUnknown(err, t("work_experience.quick_add_create_error"))
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden p-0 sm:max-w-md" showCloseButton>
        <form onSubmit={(ev) => void handleSubmit(ev)} className="flex flex-col">
          <DialogHeader className="shrink-0 px-4 pt-4 pb-2">
            <DialogTitle>{t("work_experience.new_title")}</DialogTitle>
            <DialogDescription>{t("work_experience.quick_add_dialog_desc")}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[min(70vh,560px)] overflow-y-auto px-4 pt-2 pb-6">
            <FieldGroup>
              {formError ? (
                <p role="alert" className="text-destructive text-sm">
                  {formError}
                </p>
              ) : null}
              <Field>
                <FieldLabel htmlFor="qawe-title">{t("work_experience.field_title")}</FieldLabel>
                <Input
                  id="qawe-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  autoFocus
                  disabled={submitting}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="qawe-company">{t("work_experience.company_name")}</FieldLabel>
                <Input
                  id="qawe-company"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                  disabled={submitting}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="qawe-description">{t("shared.description")}</FieldLabel>
                <Textarea
                  id="qawe-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("work_experience.quick_add_description_placeholder")}
                  disabled={submitting}
                  rows={3}
                  className="min-h-[72px] resize-y"
                />
              </Field>
              <Field orientation="horizontal">
                <FieldLabel htmlFor="qawe-remote">{t("shared.remote")}</FieldLabel>
                <Switch
                  id="qawe-remote"
                  checked={isRemote}
                  onCheckedChange={(v) => setIsRemote(Boolean(v))}
                  disabled={submitting}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="qawe-from">{t("certification.date_from")}</FieldLabel>
                <Input
                  id="qawe-from"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  disabled={submitting}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="qawe-to">{t("certification.date_to")}</FieldLabel>
                <Input
                  id="qawe-to"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  disabled={submitting}
                />
              </Field>
              <WorkExperienceSkillFieldset
                idPrefix="qawe"
                skills={skills}
                skillIds={skillIds}
                onSkillIdsChange={setSkillIds}
                emptyMessage={emptySkillsMessage}
                emptyHint={emptySkillsHint}
                onAddNew={onEmptySkillsAddNew}
                addNewAriaLabel={t("work_experience.aria_add_skill_inline")}
              />
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
