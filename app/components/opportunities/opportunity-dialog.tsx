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
  const { opportunities, addOpportunity, updateOpportunity } = useAppData()

  const existing = opportunityId
    ? opportunities.find((o) => o.id === opportunityId)
    : undefined

  const [companyId, setCompanyId] = React.useState("")
  const [roleId, setRoleId] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [url, setUrl] = React.useState("")
  const [hourlyRate, setHourlyRate] = React.useState<number | undefined>(undefined)
  const [annualSalary, setAnnualSalary] = React.useState<number | undefined>(undefined)
  const [status, setStatus] = React.useState<OpportunityStatus>("")
  const [interestLevel, setInterestLevel] = React.useState<InterestLevel>(0)

  React.useEffect(() => {
    if (!open) return
    if (isCreate) {
      setCompanyId("")
      setRoleId("")
      setDescription("")
      setUrl("")
      setHourlyRate(undefined)
      setAnnualSalary(undefined)
      setStatus("")
      setInterestLevel(0)
      return
    }
    if (!existing) return
    setCompanyId(existing.company_id)
    setRoleId(existing.role_id)
    setDescription(existing.description)
    setUrl(existing.url)
    setHourlyRate(
      existing.hourly_rate != null && Number.isFinite(existing.hourly_rate)
        ? existing.hourly_rate
        : undefined
    )
    setAnnualSalary(
      existing.annual_salary != null && Number.isFinite(existing.annual_salary)
        ? existing.annual_salary
        : undefined
    )
    setStatus(existing.status)
    setInterestLevel(
      Math.min(5, Math.max(0, Math.round(existing.interest_level))) as InterestLevel
    )
  }, [open, isCreate, existing])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!companyId || !roleId || !status) return
    if (isCreate) {
      const id = addOpportunity({
        company_id: companyId,
        role_id: roleId,
        description: description.trim(),
        url: url.trim(),
        status,
        interest_level: interestLevel,
        board_column_id: status,
        hourly_rate: hourlyRate,
        annual_salary: annualSalary,
      })
      onOpenChange(false)
      onCreated?.(id)
      return
    }
    if (!opportunityId || !existing) return
    updateOpportunity(opportunityId, {
      company_id: companyId,
      role_id: roleId,
      description: description.trim(),
      url: url.trim(),
      status,
      interest_level: interestLevel,
      board_column_id: existing.board_column_id ?? status,
      hourly_rate: hourlyRate,
      annual_salary: annualSalary,
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
                companyId={companyId}
                onCompanyIdChange={setCompanyId}
                roleId={roleId}
                onRoleIdChange={setRoleId}
                description={description}
                onDescriptionChange={setDescription}
                url={url}
                onUrlChange={setUrl}
                hourlyRate={hourlyRate}
                onHourlyRateChange={setHourlyRate}
                annualSalary={annualSalary}
                onAnnualSalaryChange={setAnnualSalary}
                status={status}
                onStatusChange={setStatus}
                interestLevel={interestLevel}
                onInterestLevelChange={setInterestLevel}
              />
            </div>
            <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none border-t bg-muted/30 px-4 py-3 sm:justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!companyId || !roleId || !status}>
                Save
              </Button>
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
