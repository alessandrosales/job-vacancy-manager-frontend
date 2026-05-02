"use client"

import * as React from "react"

/** Linha mínima para o checklist (compatível com `ApiSkill` da API). */
export type WorkExperienceSkillPickerRow = {
  id: string
  name: string
  description: string | null
}
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"

export function WorkExperienceSkillFieldset({
  idPrefix,
  skills,
  skillIds,
  onSkillIdsChange,
}: {
  idPrefix: string
  skills: readonly WorkExperienceSkillPickerRow[]
  skillIds: readonly string[]
  onSkillIdsChange: (next: string[]) => void
}) {
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

  return (
    <FieldSet data-slot="checkbox-group">
      <FieldLegend variant="label">Skills</FieldLegend>
      <FieldDescription>
        Filter and select skills for this experience. Selected: {skillIds.length}.
      </FieldDescription>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-skill-filter`}>Filter skills</FieldLabel>
        <Input
          id={`${idPrefix}-skill-filter`}
          value={needle}
          onChange={(e) => setNeedle(e.target.value)}
          placeholder="Search by name or description…"
          autoComplete="off"
        />
      </Field>
      <div className="max-h-56 overflow-y-auto rounded-md border border-border p-2">
        {skills.length === 0 ? (
          <p className="text-sm text-muted-foreground">No skills defined yet.</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No matches.</p>
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
                    className="size-4 shrink-0 rounded border border-input bg-background accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </Field>
              )
            })}
          </FieldGroup>
        )}
      </div>
    </FieldSet>
  )
}
