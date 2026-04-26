"use client"

import * as React from "react"

import { InterestLevelStarPicker } from "~/components/shared/interest-level-star-picker"
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"
import type { InterestLevel, OpportunityStatusDefinition, StatusBadgeVariant } from "~/lib/labels"

const BADGE_VARIANTS: StatusBadgeVariant[] = [
  "secondary",
  "outline",
  "default",
  "destructive",
]

type QuickDialogBase = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Chamado após criar o registro, com o novo id. */
  onAdded: (id: string) => void
}

export function QuickAddCompanyDialog({
  open,
  onOpenChange,
  onAdded,
}: QuickDialogBase) {
  const { addCompany } = useAppData()
  const [name, setName] = React.useState("")
  const [url, setUrl] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [interestLevel, setInterestLevel] = React.useState<InterestLevel>(3)

  React.useEffect(() => {
    if (!open) return
    setName("")
    setUrl("")
    setDescription("")
    setInterestLevel(3)
  }, [open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const t = name.trim()
    if (!t) return
    const id = addCompany({
      name: t,
      url: url.trim(),
      description: description.trim(),
      interest_level: interestLevel,
    })
    onAdded(id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden p-0 sm:max-w-md" showCloseButton>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <DialogHeader className="shrink-0 px-4 pt-4 pb-2">
            <DialogTitle>New company</DialogTitle>
            <DialogDescription>
              Cria a empresa e associa à oportunidade.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[min(70vh,480px)] overflow-y-auto px-4 py-2">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="qac-name">Name</FieldLabel>
                <Input
                  id="qac-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="qac-url">URL</FieldLabel>
                <Input
                  id="qac-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="qac-desc">Description</FieldLabel>
                <Textarea
                  id="qac-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </Field>
              <Field>
                <FieldLabel>Interest level</FieldLabel>
                <InterestLevelStarPicker
                  value={interestLevel}
                  onChange={setInterestLevel}
                />
              </Field>
            </FieldGroup>
          </div>
          <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none border-t bg-muted/30 px-4 py-3 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function QuickAddRoleDialog({ open, onOpenChange, onAdded }: QuickDialogBase) {
  const { addRole } = useAppData()
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [interestLevel, setInterestLevel] = React.useState<InterestLevel>(3)

  React.useEffect(() => {
    if (!open) return
    setName("")
    setDescription("")
    setInterestLevel(3)
  }, [open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const t = name.trim()
    if (!t) return
    const id = addRole({
      name: t,
      description: description.trim(),
      interest_level: interestLevel,
    })
    onAdded(id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden p-0 sm:max-w-md" showCloseButton>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <DialogHeader className="shrink-0 px-4 pt-4 pb-2">
            <DialogTitle>New role</DialogTitle>
            <DialogDescription>
              Cria o cargo e associa à oportunidade.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[min(70vh,420px)] overflow-y-auto px-4 py-2">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="qar-name">Name</FieldLabel>
                <Input
                  id="qar-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="qar-desc">Description</FieldLabel>
                <Textarea
                  id="qar-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </Field>
              <Field>
                <FieldLabel>Interest level</FieldLabel>
                <InterestLevelStarPicker
                  value={interestLevel}
                  onChange={setInterestLevel}
                />
              </Field>
            </FieldGroup>
          </div>
          <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none border-t bg-muted/30 px-4 py-3 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function QuickAddOpportunityStatusDialog({
  open,
  onOpenChange,
  onAdded,
}: QuickDialogBase) {
  const { addOpportunityStatus } = useAppData()
  const [label, setLabel] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [variant, setVariant] = React.useState<StatusBadgeVariant>("secondary")

  React.useEffect(() => {
    if (!open) return
    setLabel("")
    setDescription("")
    setVariant("secondary")
  }, [open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const t = label.trim()
    if (!t) return
    const row: Omit<OpportunityStatusDefinition, "id"> = {
      label: t,
      description: description.trim() || undefined,
      variant,
    }
    const id = addOpportunityStatus(row)
    onAdded(id)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden p-0 sm:max-w-md" showCloseButton>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <DialogHeader className="shrink-0 px-4 pt-4 pb-2">
            <DialogTitle>New opportunity status</DialogTitle>
            <DialogDescription>
              Novo estágio no pipeline (coluna no Kanban).
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[min(70vh,420px)] overflow-y-auto px-4 py-2">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="qas-label">Label</FieldLabel>
                <Input
                  id="qas-label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  required
                  autoFocus
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="qas-desc">Description</FieldLabel>
                <Textarea
                  id="qas-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="qas-variant">Badge variant</FieldLabel>
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
          <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none border-t bg-muted/30 px-4 py-3 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
