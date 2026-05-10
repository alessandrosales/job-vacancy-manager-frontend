"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { PlusIcon } from "lucide-react"

/** Linha mínima para o checklist (compatível com `ApiSkill` da API). */
export type WorkExperienceSkillPickerRow = {
  id: string
  name: string
  description: string | null
}
import { Button } from "~/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { pagesI18nNs } from "~/lib/i18n/config"

export function WorkExperienceSkillFieldset({
  idPrefix,
  skills,
  skillIds,
  onSkillIdsChange,
  emptyMessage,
  emptyHint,
  onAddNew,
  addNewAriaLabel,
}: {
  idPrefix: string
  skills: readonly WorkExperienceSkillPickerRow[]
  skillIds: readonly string[]
  onSkillIdsChange: (next: string[]) => void
  emptyMessage?: string
  emptyHint?: string
  onAddNew?: () => void
  addNewAriaLabel?: string
}) {
  const { t } = useTranslation(pagesI18nNs)
  const [needle, setNeedle] = React.useState("")
  const q = needle.trim().toLowerCase()
  const filtered = React.useMemo(() => {
    if (!q) return [...skills]
    return skills.filter((s) =>
      `${s.name} ${s.description ?? ""}`.toLowerCase().includes(q)
    )
  }, [skills, q])

  const selectedSet = React.useMemo(() => new Set(skillIds), [skillIds])

  function toggle(id: string, checked: boolean) {
    if (checked) {
      if (selectedSet.has(id)) return
      onSkillIdsChange([...skillIds, id])
      return
    }
    onSkillIdsChange(skillIds.filter((x) => x !== id))
  }

  const emptyBody = emptyMessage ?? t("work_experience.no_skills_defined")

  return (
    <FieldSet className="gap-3" data-slot="checkbox-group">
      <FieldLegend variant="label">
        {t("work_experience.skills_fieldset_legend")}
      </FieldLegend>
      <FieldDescription>
        {t("work_experience.skills_fieldset_desc", { count: skillIds.length })}
      </FieldDescription>
      {skills.length > 0 ? (
        <div className="flex flex-col gap-1">
          <div className="flex flex-row items-end gap-2">
            <Field className="min-w-0 flex-1">
              <FieldLabel htmlFor={`${idPrefix}-skill-filter`}>
                {t("work_experience.filter_skills")}
              </FieldLabel>
              <Input
                id={`${idPrefix}-skill-filter`}
                value={needle}
                onChange={(e) => setNeedle(e.target.value)}
                placeholder={t("work_experience.search_skills_placeholder")}
                autoComplete="off"
              />
            </Field>
            {onAddNew ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="mb-0.5 shrink-0"
                aria-label={
                  addNewAriaLabel ?? t("work_experience.aria_add_skill_inline")
                }
                onClick={onAddNew}
              >
                <PlusIcon />
              </Button>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0">
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="h-6 px-1.5 font-normal text-muted-foreground"
              onClick={() => onSkillIdsChange(skills.map((s) => s.id))}
              disabled={skills.every((s) => selectedSet.has(s.id))}
            >
              {t("work_experience.select_all_skills")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="h-6 px-1.5 font-normal text-muted-foreground"
              onClick={() => onSkillIdsChange([])}
              disabled={skillIds.length === 0}
            >
              {t("work_experience.clear_skill_selection")}
            </Button>
          </div>
        </div>
      ) : null}
      <div className="max-h-56 overflow-y-auto rounded-md border border-border p-2">
        {skills.length === 0 ? (
          onAddNew ? (
            <div className="flex min-h-8 flex-row items-stretch gap-2 text-muted-foreground">
              <p className="flex flex-1 items-center text-sm">{emptyBody}</p>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                aria-label={
                  addNewAriaLabel ?? t("work_experience.aria_add_skill_inline")
                }
                onClick={onAddNew}
              >
                <PlusIcon />
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{emptyBody}</p>
          )
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {t("work_experience.no_skill_matches")}
          </p>
        ) : (
          <FieldGroup className="gap-2">
            {filtered.map((s) => {
              const inputId = `${idPrefix}-skill-${encodeURIComponent(s.id)}`
              return (
                <Field key={s.id} orientation="horizontal">
                  <FieldLabel htmlFor={inputId} className="font-normal">
                    {s.name}
                  </FieldLabel>
                  <input
                    id={inputId}
                    type="checkbox"
                    role="checkbox"
                    checked={selectedSet.has(s.id)}
                    onChange={(e) => toggle(s.id, e.target.checked)}
                    className="size-4 shrink-0 rounded border border-input bg-background accent-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </Field>
              )
            })}
          </FieldGroup>
        )}
      </div>
      {onAddNew && emptyHint ? (
        <FieldDescription>{emptyHint}</FieldDescription>
      ) : null}
    </FieldSet>
  )
}
