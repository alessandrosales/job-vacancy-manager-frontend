"use client"

import * as React from "react"
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

  const emptyBody =
    emptyMessage ?? "No records yet."

  return (
    <FieldSet data-slot="checkbox-group">
      <FieldLegend variant="label">{legend}</FieldLegend>
      <FieldDescription>{description}</FieldDescription>
      {rows.length > 0 ? (
        <div className="flex flex-row items-end gap-2">
          <Field className="min-w-0 flex-1">
            <FieldLabel htmlFor={`${idPrefix}-filter`}>Filter</FieldLabel>
            <Input
              id={`${idPrefix}-filter`}
              value={needle}
              onChange={(e) => setNeedle(e.target.value)}
              placeholder="Search…"
              autoComplete="off"
            />
          </Field>
          {onAddNew ? (
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="mb-0.5 shrink-0"
              aria-label={addNewAriaLabel ?? `Add ${legend}`}
              onClick={onAddNew}
            >
              <PlusIcon />
            </Button>
          ) : null}
        </div>
      ) : null}
      <div className="max-h-48 overflow-y-auto rounded-md border border-border p-2">
        {rows.length === 0 ? (
          onAddNew ? (
            <div className="text-muted-foreground flex min-h-8 flex-row items-stretch gap-2">
              <p className="flex flex-1 items-center text-sm">{emptyBody}</p>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                aria-label={addNewAriaLabel ?? `Add ${legend}`}
                onClick={onAddNew}
              >
                <PlusIcon />
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">{emptyBody}</p>
          )
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm">No matches.</p>
        ) : (
          <FieldGroup className="gap-2">
            {filtered.map((row) => {
              const inputId = `${idPrefix}-${encodeURIComponent(row.id)}`
              return (
                <Field key={row.id} orientation="horizontal">
                  <FieldLabel htmlFor={inputId} className="min-w-0 flex-1 font-normal">
                    <span className="block truncate">{row.primary}</span>
                    {row.secondary ? (
                      <span className="text-muted-foreground block truncate text-xs font-normal">
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
                    className="size-4 shrink-0 rounded border border-input bg-background accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
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
      <FieldDescription>Selected: {selectedIds.length}</FieldDescription>
    </FieldSet>
  )
}
