"use client"

import * as React from "react"

import {
  OpportunityFormFields,
  type OpportunityFormReferenceLists,
} from "~/components/opportunities/opportunity-form-fields"
import { useAppData, type Opportunity } from "~/components/providers/app-data-provider"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { ApiError } from "~/lib/api/errors"
import {
  apiOpportunityToOpportunity,
  opportunityFormToApiWrite,
} from "~/lib/opportunity-api-mappers"
import {
  createOpportunity as createOpportunityApi,
  getOpportunity as getOpportunityApi,
  updateOpportunity as updateOpportunityApi,
} from "~/lib/api/resources/opportunities"
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
  /**
   * Quando definido, carrega e grava via API; `referenceLists` alimenta os selects.
   * `onReferenceListsRefresh` atualiza listas após quick-create (+). `onSaved` após salvar.
   */
  referenceLists?: OpportunityFormReferenceLists
  onSaved?: () => void
  onReferenceListsRefresh?: () => void | Promise<void>
}

function formErrorText(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const base = err.fieldErrors.base?.[0]
    if (base) return base
    const first = Object.values(err.fieldErrors).flat()[0]
    if (first) return first
  }
  return fallback
}

function applyOpportunityToFormState(
  o: Opportunity,
  setters: {
    setCompanyId: (v: string) => void
    setRoleId: (v: string) => void
    setDescription: (v: string) => void
    setUrl: (v: string) => void
    setHourlyRate: (v: number | undefined) => void
    setAnnualSalary: (v: number | undefined) => void
    setStatus: (v: OpportunityStatus) => void
    setInterestLevel: (v: InterestLevel) => void
  }
) {
  setters.setCompanyId(
    o.company_id != null && o.company_id !== ""
      ? String(o.company_id)
      : ""
  )
  setters.setRoleId(
    o.role_id != null && o.role_id !== "" ? String(o.role_id) : ""
  )
  setters.setDescription(o.description)
  setters.setUrl(o.url)
  setters.setHourlyRate(
    o.hourly_rate != null && Number.isFinite(o.hourly_rate) ? o.hourly_rate : undefined
  )
  setters.setAnnualSalary(
    o.annual_salary != null && Number.isFinite(o.annual_salary)
      ? o.annual_salary
      : undefined
  )
  setters.setStatus(o.status)
  setters.setInterestLevel(
    Math.min(5, Math.max(0, Math.round(o.interest_level))) as InterestLevel
  )
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
  referenceLists,
  onSaved,
  onReferenceListsRefresh,
}: OpportunityDialogProps) {
  const isCreate = mode === "create"
  const useApi = Boolean(referenceLists)
  const { opportunities, addOpportunity, updateOpportunity } = useAppData()

  const existingLocal = opportunityId
    ? opportunities.find((o) => o.id === opportunityId)
    : undefined

  const [remoteOpp, setRemoteOpp] = React.useState<Opportunity | null>(null)
  const [remoteLoadState, setRemoteLoadState] = React.useState<
    "idle" | "loading" | "error"
  >("idle")

  const [companyId, setCompanyId] = React.useState("")
  const [roleId, setRoleId] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [url, setUrl] = React.useState("")
  const [hourlyRate, setHourlyRate] = React.useState<number | undefined>(undefined)
  const [annualSalary, setAnnualSalary] = React.useState<number | undefined>(undefined)
  const [status, setStatus] = React.useState<OpportunityStatus>("")
  const [interestLevel, setInterestLevel] = React.useState<InterestLevel>(0)

  const [submitting, setSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  const existing = useApi ? remoteOpp : existingLocal

  React.useEffect(() => {
    if (!open || !useApi || isCreate || !opportunityId) {
      setRemoteOpp(null)
      setRemoteLoadState("idle")
      return
    }
    const ac = new AbortController()
    setRemoteLoadState("loading")
    setRemoteOpp(null)
    void (async () => {
      try {
        const api = await getOpportunityApi(opportunityId, { signal: ac.signal })
        if (ac.signal.aborted) return
        setRemoteOpp(apiOpportunityToOpportunity(api))
        setRemoteLoadState("idle")
      } catch {
        if (ac.signal.aborted) return
        setRemoteOpp(null)
        setRemoteLoadState("error")
      }
    })()
    return () => ac.abort()
  }, [open, useApi, isCreate, opportunityId])

  const setters = React.useMemo(
    () => ({
      setCompanyId,
      setRoleId,
      setDescription,
      setUrl,
      setHourlyRate,
      setAnnualSalary,
      setStatus,
      setInterestLevel,
    }),
    []
  )

  /** Antes do paint: evita montar o formulário com FKs vazias e efeitos dos selects limparem os ids. */
  React.useLayoutEffect(() => {
    if (!open) return
    setFormError(null)
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
    applyOpportunityToFormState(existing, setters)
  }, [open, isCreate, existing, setters])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!companyId || !roleId || !status) return

    const payload = opportunityFormToApiWrite({
      company_id: companyId,
      role_id: roleId,
      status_id: status,
      description: description.trim(),
      url: url.trim(),
      interest_level: interestLevel,
      hourly_rate: hourlyRate,
      annual_salary: annualSalary,
    })

    if (useApi) {
      setFormError(null)
      setSubmitting(true)
      try {
        if (isCreate) {
          const created = await createOpportunityApi(payload)
          onCreated?.(created.id)
        } else if (opportunityId) {
          await updateOpportunityApi(opportunityId, payload)
        }
        onSaved?.()
        onOpenChange(false)
      } catch (err) {
        setFormError(formErrorText(err, "Não foi possível salvar."))
      } finally {
        setSubmitting(false)
      }
      return
    }

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
    if (!opportunityId || !existingLocal) return
    updateOpportunity(opportunityId, {
      company_id: companyId,
      role_id: roleId,
      description: description.trim(),
      url: url.trim(),
      status,
      interest_level: interestLevel,
      board_column_id: existingLocal.board_column_id ?? status,
      hourly_rate: hourlyRate,
      annual_salary: annualSalary,
    })
    onOpenChange(false)
  }

  const showCreateForm = open && isCreate
  const showEditForm =
    open &&
    !isCreate &&
    Boolean(opportunityId) &&
    (useApi ? remoteLoadState === "idle" && remoteOpp != null : Boolean(existingLocal))

  const showEditLoading =
    open && useApi && !isCreate && Boolean(opportunityId) && remoteLoadState === "loading"

  const showNotFound =
    open &&
    !isCreate &&
    Boolean(opportunityId) &&
    (useApi ? remoteLoadState === "error" : !existingLocal)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[min(90vh,720px)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {showEditLoading ? (
          <div className="text-muted-foreground p-6 text-sm">Carregando…</div>
        ) : null}

        {showEditForm || showCreateForm ? (
          <form
            onSubmit={(ev) => void handleSubmit(ev)}
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
              {formError ? (
                <p
                  role="alert"
                  className="border-destructive/50 bg-destructive/10 text-destructive mb-3 rounded-md border px-3 py-2 text-sm"
                >
                  {formError}
                </p>
              ) : null}
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
                referenceLists={referenceLists}
                onReferenceDataRefresh={onReferenceListsRefresh}
              />
            </div>
            <DialogFooter className="mx-0 mb-0 shrink-0 rounded-none border-t bg-muted/30 px-4 py-3 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!companyId || !roleId || !status || submitting}
              >
                {submitting ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        ) : null}

        {showNotFound ? (
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
