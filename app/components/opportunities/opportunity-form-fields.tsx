"use client"

import * as React from "react"
import { PlusIcon } from "lucide-react"

import { InterestLevelStarPicker } from "~/components/shared/interest-level-star-picker"
import { QuickAddCompanyDialog } from "~/components/opportunities/quick-add/quick-add-company-dialog"
import { QuickAddOpportunityStatusDialog } from "~/components/opportunities/quick-add/quick-add-opportunity-status-dialog"
import { QuickAddRoleDialog } from "~/components/opportunities/quick-add/quick-add-role-dialog"
import { useAppData } from "~/components/providers/app-data-provider"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Button } from "~/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"
import type { Company, Role } from "~/components/providers/app-data-provider"
import { sortOpportunityStatusesByPosition } from "~/lib/kanban-columns"
import type {
  InterestLevel,
  OpportunityStatus,
  OpportunityStatusDefinition,
} from "~/lib/labels"

/** Comparação tolerante a tipo/coerção JSON — evita limpar FK válido por mismatch estrito. */
function fkExistsInList(list: readonly { id: string }[], fk: string): boolean {
  if (fk === "") return true
  const n = String(fk).trim()
  return list.some((row) => String(row.id).trim() === n)
}

/** Listas vindas da API (ou pai); quick-add usa POST na API quando `onReferenceDataRefresh` existe. */
export type OpportunityFormReferenceLists = {
  companies: Company[]
  roles: Role[]
  opportunityStatuses: OpportunityStatusDefinition[]
}

export type OpportunityFormFieldsProps = {
  /** Prefixo para `id` / `htmlFor` únicos (página, dialog, etc.) */
  idPrefix: string
  companyId: string
  onCompanyIdChange: (id: string) => void
  roleId: string
  onRoleIdChange: (id: string) => void
  description: string
  onDescriptionChange: (v: string) => void
  url: string
  onUrlChange: (v: string) => void
  hourlyRate: number | undefined
  onHourlyRateChange: (v: number | undefined) => void
  annualSalary: number | undefined
  onAnnualSalaryChange: (v: number | undefined) => void
  status: OpportunityStatus
  onStatusChange: (v: OpportunityStatus) => void
  interestLevel: InterestLevel
  onInterestLevelChange: (v: InterestLevel) => void
  referenceLists?: OpportunityFormReferenceLists
  /** Após criar empresa/cargo/status via API (quick-add); atualiza as listas no pai. */
  onReferenceDataRefresh?: () => void | Promise<void>
}

/**
 * Campos do formulário de oportunidade — empresa e cargo via selects (FKs).
 */
export function OpportunityFormFields({
  idPrefix,
  companyId,
  onCompanyIdChange,
  roleId,
  onRoleIdChange,
  description,
  onDescriptionChange,
  url,
  onUrlChange,
  hourlyRate,
  onHourlyRateChange,
  annualSalary,
  onAnnualSalaryChange,
  status,
  onStatusChange,
  interestLevel,
  onInterestLevelChange,
  referenceLists,
  onReferenceDataRefresh,
}: OpportunityFormFieldsProps) {
  const appData = useAppData()
  const companies = referenceLists?.companies ?? appData.companies
  const roles = referenceLists?.roles ?? appData.roles
  const opportunityStatuses =
    referenceLists?.opportunityStatuses ?? appData.opportunity_statuses
  const opportunityStatusesSorted = React.useMemo(
    () => sortOpportunityStatusesByPosition(opportunityStatuses),
    [opportunityStatuses]
  )
  /** Com listas da API, criar sempre via POST — `onReferenceDataRefresh` atualiza os selects. */
  const persistQuickAddViaApi = Boolean(referenceLists)

  const [companyDialogOpen, setCompanyDialogOpen] = React.useState(false)
  const [roleDialogOpen, setRoleDialogOpen] = React.useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false)

  /** Se o id não existir mais (ex.: empresa removida), volta a vazio — não pré-seleciona outro. */
  React.useEffect(() => {
    if (
      companyId !== "" &&
      companies.length > 0 &&
      !fkExistsInList(companies, companyId)
    ) {
      onCompanyIdChange("")
    }
  }, [companies, companyId, onCompanyIdChange])

  React.useEffect(() => {
    if (roleId !== "" && roles.length > 0 && !fkExistsInList(roles, roleId)) {
      onRoleIdChange("")
    }
  }, [roles, roleId, onRoleIdChange])

  React.useEffect(() => {
    if (
      status !== "" &&
      opportunityStatuses.length > 0 &&
      !fkExistsInList(opportunityStatuses, status)
    ) {
      onStatusChange("" as OpportunityStatus)
    }
  }, [opportunityStatuses, status, onStatusChange])

  return (
    <>
      <QuickAddCompanyDialog
        open={companyDialogOpen}
        onOpenChange={setCompanyDialogOpen}
        onAdded={onCompanyIdChange}
        persistViaApi={persistQuickAddViaApi}
        onPersistedViaApi={onReferenceDataRefresh}
      />
      <QuickAddRoleDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        onAdded={onRoleIdChange}
        persistViaApi={persistQuickAddViaApi}
        onPersistedViaApi={onReferenceDataRefresh}
      />
      <QuickAddOpportunityStatusDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        onAdded={onStatusChange}
        persistViaApi={persistQuickAddViaApi}
        onPersistedViaApi={onReferenceDataRefresh}
      />
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`${idPrefix}-company`}>Company</FieldLabel>
          <div className="flex min-w-0 flex-row items-stretch gap-2">
            {companies.length > 0 ? (
              <Select
                key={companyId === "" ? "company-empty" : `company-${companyId}`}
                value={companyId === "" ? undefined : companyId}
                onValueChange={onCompanyIdChange}
              >
                <SelectTrigger
                  id={`${idPrefix}-company`}
                  className="min-w-0 flex-1"
                >
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {companies.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            ) : (
              <p
                id={`${idPrefix}-company`}
                className="text-muted-foreground flex min-h-8 flex-1 items-center text-sm"
              >
                Nenhuma empresa cadastrada.
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              aria-label="Add company"
              onClick={() => setCompanyDialogOpen(true)}
            >
              <PlusIcon />
            </Button>
          </div>
          {companies.length === 0 ? (
            <FieldDescription>
              Use + to create a company and select it here.
            </FieldDescription>
          ) : null}
        </Field>
        <Field>
          <FieldLabel htmlFor={`${idPrefix}-role`}>Role</FieldLabel>
          <div className="flex min-w-0 flex-row items-stretch gap-2">
            {roles.length > 0 ? (
              <Select
                key={roleId === "" ? "role-empty" : `role-${roleId}`}
                value={roleId === "" ? undefined : roleId}
                onValueChange={onRoleIdChange}
              >
                <SelectTrigger id={`${idPrefix}-role`} className="min-w-0 flex-1">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            ) : (
              <p
                id={`${idPrefix}-role`}
                className="text-muted-foreground flex min-h-8 flex-1 items-center text-sm"
              >
                Nenhum cargo cadastrado.
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              aria-label="Add role"
              onClick={() => setRoleDialogOpen(true)}
            >
              <PlusIcon />
            </Button>
          </div>
          {roles.length === 0 ? (
            <FieldDescription>
              Use + to create a role and select it here.
            </FieldDescription>
          ) : null}
        </Field>
        <Field>
          <FieldLabel htmlFor={`${idPrefix}-desc`}>Description</FieldLabel>
          <Textarea
            id={`${idPrefix}-desc`}
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            required
            rows={4}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${idPrefix}-url`}>URL</FieldLabel>
          <Input
            id={`${idPrefix}-url`}
            type="url"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor={`${idPrefix}-hourly-rate`}>Hourly rate</FieldLabel>
          <Input
            id={`${idPrefix}-hourly-rate`}
            type="number"
            min={0}
            step="0.01"
            value={hourlyRate === undefined ? "" : hourlyRate}
            onChange={(e) => {
              const v = e.target.value
              if (v === "") {
                onHourlyRateChange(undefined)
                return
              }
              const n = Number(v)
              if (Number.isFinite(n) && n >= 0) onHourlyRateChange(n)
            }}
            placeholder="e.g. 75"
          />
          <FieldDescription>
            Optional. Gross pay per hour in your main currency (e.g. USD).
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${idPrefix}-annual-salary`}>Annual salary</FieldLabel>
          <Input
            id={`${idPrefix}-annual-salary`}
            type="number"
            min={0}
            step="1"
            value={annualSalary === undefined ? "" : annualSalary}
            onChange={(e) => {
              const v = e.target.value
              if (v === "") {
                onAnnualSalaryChange(undefined)
                return
              }
              const n = Number(v)
              if (Number.isFinite(n) && n >= 0) onAnnualSalaryChange(n)
            }}
            placeholder="e.g. 120000"
          />
          <FieldDescription>
            Optional. Total annual compensation in the same currency.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor={`${idPrefix}-status`}>Opportunity status</FieldLabel>
          <div className="flex min-w-0 flex-row items-stretch gap-2">
            {opportunityStatuses.length > 0 ? (
              <Select
                key={status === "" ? "status-empty" : `status-${status}`}
                value={status === "" ? undefined : status}
                onValueChange={(v) => onStatusChange(v as OpportunityStatus)}
              >
                <SelectTrigger id={`${idPrefix}-status`} className="min-w-0 flex-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {opportunityStatusesSorted.map((st) => (
                      <SelectItem key={st.id} value={st.id}>
                        {st.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            ) : (
              <p
                id={`${idPrefix}-status`}
                className="text-muted-foreground flex min-h-8 flex-1 items-center text-sm"
              >
                Nenhum status cadastrado.
              </p>
            )}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0"
              aria-label="Add opportunity status"
              onClick={() => setStatusDialogOpen(true)}
            >
              <PlusIcon />
            </Button>
          </div>
          {opportunityStatuses.length === 0 ? (
            <FieldDescription>
              Use + to create a pipeline status and select it here.
            </FieldDescription>
          ) : null}
        </Field>
        <Field>
          <FieldLabel>Interest level</FieldLabel>
          <InterestLevelStarPicker
            value={interestLevel}
            onChange={onInterestLevelChange}
          />
        </Field>
      </FieldGroup>
    </>
  )
}
