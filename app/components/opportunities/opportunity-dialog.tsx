"use client"

import * as React from "react"

import { OpportunityFormFields } from "~/components/opportunities/opportunity-form-fields"
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
import { DEFAULT_OPPORTUNITY_STATUS_DEFINITIONS } from "~/lib/labels"
import type { InterestLevel, OpportunityStatus } from "~/lib/labels"

const DIALOG_ID_EDIT = "opp-dialog"
const DIALOG_ID_CREATE = "opp-dialog-new"

type OpportunityDialogMode = "edit" | "create"

type OpportunityDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Em `mode="edit"`, id da oportunidade; em `mode="create"` pode ser `null`. */
  opportunityId: string | null
  /** Padrão: edição de registro existente. */
  mode?: OpportunityDialogMode
  /** Em `mode="create"`, chamado após salvar com o id retornado por `addOpportunity`. */
  onCreated?: (id: string) => void
}

/**
 * Criação ou edição de oportunidade em diálogo — mesmos campos da página de registro.
 */
export function OpportunityDialog({
  open,
  onOpenChange,
  opportunityId,
  mode = "edit",
  onCreated,
}: OpportunityDialogProps) {
  const isCreate = mode === "create"
  const {
    opportunities,
    addOpportunity,
    updateOpportunity,
    opportunity_statuses: opportunityStatuses,
  } = useAppData()

  const defaultStatusId =
    opportunityStatuses[0]?.id ?? DEFAULT_OPPORTUNITY_STATUS_DEFINITIONS[0]!.id
  const existing = opportunityId
    ? opportunities.find((o) => o.id === opportunityId)
    : undefined

  const [company, setCompany] = React.useState("")
  const [role, setRole] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [url, setUrl] = React.useState("")
  const [status, setStatus] = React.useState<OpportunityStatus>(defaultStatusId)
  const [interestLevel, setInterestLevel] = React.useState<InterestLevel>(0)

  React.useEffect(() => {
    if (!open) return
    if (isCreate) {
      setCompany("")
      setRole("")
      setDescription("")
      setUrl("")
      setStatus(defaultStatusId)
      setInterestLevel(0)
      return
    }
    if (!existing) return
    setCompany(existing.company)
    setRole(existing.role)
    setDescription(existing.description)
    setUrl(existing.url)
    setStatus(existing.status)
    setInterestLevel(
      Math.min(5, Math.max(0, Math.round(existing.interest_level))) as InterestLevel
    )
  }, [open, isCreate, existing, defaultStatusId])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isCreate) {
      const id = addOpportunity({
        company: company.trim(),
        role: role.trim(),
        description: description.trim(),
        url: url.trim(),
        status,
        interest_level: interestLevel,
        board_column_id: status,
      })
      onOpenChange(false)
      onCreated?.(id)
      return
    }
    if (!opportunityId || !existing) return
    updateOpportunity(opportunityId, {
      company: company.trim(),
      role: role.trim(),
      description: description.trim(),
      url: url.trim(),
      status,
      interest_level: interestLevel,
      board_column_id: existing.board_column_id ?? status,
    })
    onOpenChange(false)
  }

  const showEditForm = open && !isCreate && opportunityId && existing
  const showCreateForm = open && isCreate

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[min(90vh,720px)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {showEditForm || showCreateForm ? (
          <form
            onSubmit={handleSubmit}
            className="flex max-h-[min(90vh,720px)] flex-col"
          >
            <DialogHeader className="shrink-0 px-4 pt-4 pb-2">
              <DialogTitle>
                {showCreateForm ? "New opportunity" : "Edit opportunity"}
              </DialogTitle>
              <DialogDescription>
                {showCreateForm
                  ? "Adicione uma vaga rapidamente. Os mesmos campos da página de oportunidade."
                  : "Atualize os dados desta vaga. Mesmos campos da página de oportunidade."}
              </DialogDescription>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2">
              <OpportunityFormFields
                idPrefix={showCreateForm ? DIALOG_ID_CREATE : DIALOG_ID_EDIT}
                company={company}
                onCompanyChange={setCompany}
                role={role}
                onRoleChange={setRole}
                description={description}
                onDescriptionChange={setDescription}
                url={url}
                onUrlChange={setUrl}
                status={status}
                onStatusChange={setStatus}
                interestLevel={interestLevel}
                onInterestLevelChange={setInterestLevel}
                opportunityStatuses={opportunityStatuses}
              />
            </div>
            <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none border-t bg-muted/30 px-4 py-3 sm:justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        ) : open && !isCreate && opportunityId && !existing ? (
          <div className="p-4">
            <DialogHeader>
              <DialogTitle>Oportunidade não encontrada</DialogTitle>
              <DialogDescription>
                O registro pode ter sido removido. Feche e tente de novo.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mx-0 mb-0 rounded-none bg-transparent px-0 pt-4 pb-0">
              <Button type="button" onClick={() => onOpenChange(false)}>
                Fechar
              </Button>
            </DialogFooter>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
