"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { PlusIcon } from "lucide-react"

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

export type ResumePickRow = {
  id: string
  primary: string
  secondary?: string
}

export function ResumeLinkedMultiFieldset({
  idPrefix,
  legend,
  description,
  rows,
  selectedIds,
  onSelectedIdsChange,
  emptyMessage,
  emptyHint,
  onAddNew,
  addNewAriaLabel,
}: {
  idPrefix: string
  legend: string
  description: string
  rows: readonly ResumePickRow[]
  selectedIds: readonly string[]
  onSelectedIdsChange: (next: string[]) => void
  /** Quando não há linhas e `onAddNew` existe, substitui o texto padrão “No records yet.” */
  emptyMessage?: string
  emptyHint?: string
  onAddNew?: () => void
  addNewAriaLabel?: string
}) {
  const { t } = useTranslation(pagesI18nNs)
  const [needle, setNeedle] = React.useState("")
  const q = needle.trim().toLowerCase()
  const filtered = React.useMemo(() => {
    if (!q) return [...rows]
    return rows.filter((row) => {
      const hay = `${row.primary} ${row.secondary ?? ""}`.toLowerCase()
      return hay.includes(q)
    })
  }, [rows, q])

  const selectedSet = React.useMemo(() => new Set(selectedIds), [selectedIds])

  function toggle(id: string, checked: boolean) {
    if (checked) {
      if (selectedSet.has(id)) return
      onSelectedIdsChange([...selectedIds, id])
      return
    }
    onSelectedIdsChange(selectedIds.filter((x) => x !== id))
  }

  const emptyBody = emptyMessage ?? t("resume.linked_fieldset.empty_default")

  return (
    <FieldSet className="gap-3" data-slot="checkbox-group">
      <FieldLegend variant="label">{legend}</FieldLegend>
      <FieldDescription>{description}</FieldDescription>
      {rows.length > 0 ? (
        <div className="flex flex-col gap-1">
          <div className="flex flex-row items-end gap-2">
            <Field className="min-w-0 flex-1">
              <FieldLabel htmlFor={`${idPrefix}-filter`}>
                {t("resume.linked_fieldset.filter_label")}
              </FieldLabel>
              <Input
                id={`${idPrefix}-filter`}
                value={needle}
                onChange={(e) => setNeedle(e.target.value)}
                placeholder={t("shared.search_short")}
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
                  addNewAriaLabel ??
                  t("resume.linked_fieldset.aria_add_legend", { legend })
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
              onClick={() => onSelectedIdsChange(rows.map((r) => r.id))}
              disabled={rows.every((r) => selectedSet.has(r.id))}
            >
              {t("resume.linked_fieldset.select_all")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="xs"
              className="h-6 px-1.5 font-normal text-muted-foreground"
              onClick={() => onSelectedIdsChange([])}
              disabled={selectedIds.length === 0}
            >
              {t("resume.linked_fieldset.clear_selection")}
            </Button>
          </div>
        </div>
      ) : null}
      <div className="max-h-48 overflow-y-auto rounded-md border border-border p-2">
        {rows.length === 0 ? (
          onAddNew ? (
            <div className="flex min-h-8 flex-row items-stretch gap-2 text-muted-foreground">
              <p className="flex flex-1 items-center text-sm">{emptyBody}</p>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                aria-label={
                  addNewAriaLabel ??
                  t("resume.linked_fieldset.aria_add_legend", { legend })
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
            {t("resume.linked_fieldset.no_matches")}
          </p>
        ) : (
          <FieldGroup className="gap-2">
            {filtered.map((row) => {
              const inputId = `${idPrefix}-${encodeURIComponent(row.id)}`
              return (
                <Field key={row.id} orientation="horizontal">
                  <FieldLabel
                    htmlFor={inputId}
                    className="min-w-0 flex-1 font-normal"
                  >
                    <span className="block truncate">{row.primary}</span>
                    {row.secondary ? (
                      <span className="block truncate text-xs font-normal text-muted-foreground">
                        {row.secondary}
                      </span>
                    ) : null}
                  </FieldLabel>
                  <input
                    id={inputId}
                    type="checkbox"
                    role="checkbox"
                    checked={selectedSet.has(row.id)}
                    onChange={(e) => toggle(row.id, e.target.checked)}
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
      <FieldDescription>
        {t("resume.linked_fieldset.selected_count", {
          count: selectedIds.length,
        })}
      </FieldDescription>
    </FieldSet>
  )
}
