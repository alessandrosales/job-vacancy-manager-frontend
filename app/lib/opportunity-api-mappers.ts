import type {
  Company,
  Opportunity,
  Role,
} from "~/components/providers/app-data-provider"
import type { ApiCompany } from "~/lib/api/resources/companies"
import type {
  ApiOpportunity,
  ApiOpportunityWrite,
} from "~/lib/api/resources/opportunities"
import type { ApiOpportunityStatus } from "~/lib/api/resources/opportunity-statuses"
import type { ApiRole } from "~/lib/api/resources/roles"
import type { InterestLevel, OpportunityStatusDefinition } from "~/lib/labels"

/** Converte resposta da API para o tipo usado na UI (Kanban, tabela, formulário). */
export function apiOpportunityToOpportunity(api: ApiOpportunity): Opportunity {
  return {
    id: String(api.id),
    company_id:
      api.company_id != null && api.company_id !== ""
        ? String(api.company_id)
        : "",
    role_id:
      api.role_id != null && api.role_id !== "" ? String(api.role_id) : "",
    description: api.description ?? "",
    url: api.url ?? "",
    status: api.status_id,
    interest_level: api.interest_level,
    hourly_rate:
      api.hourly_rate != null && Number.isFinite(api.hourly_rate)
        ? api.hourly_rate
        : undefined,
    annual_salary:
      api.annual_salary != null && Number.isFinite(api.annual_salary)
        ? api.annual_salary
        : undefined,
    updated_at: api.updated_at,
    created_at: api.created_at,
  }
}

export function apiCompanyToCompany(c: ApiCompany): Company {
  return {
    id: c.id,
    name: c.name,
    url: c.url ?? "",
    description: c.description ?? "",
    interest_level: c.interest_level as InterestLevel,
  }
}

export function apiRoleToRole(r: ApiRole): Role {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? "",
    interest_level: r.interest_level as InterestLevel,
  }
}

export function apiOpportunityStatusToDefinition(
  s: ApiOpportunityStatus
): OpportunityStatusDefinition {
  return {
    id: s.id,
    label: s.label,
    description: s.description ?? undefined,
    variant: s.variant,
    position:
      typeof s.position === "number" && Number.isFinite(s.position)
        ? s.position
        : 0,
  }
}

/** Payload para `POST/PATCH opportunities` a partir do formulário. */
export function opportunityFormToApiWrite(params: {
  company_id: string
  role_id: string
  status_id: string
  description: string
  url: string
  interest_level: number
  hourly_rate?: number
  annual_salary?: number
}): Partial<ApiOpportunityWrite> {
  return {
    company_id: params.company_id,
    role_id: params.role_id,
    status_id: params.status_id,
    description:
      params.description.trim() === "" ? null : params.description.trim(),
    url: params.url.trim() === "" ? null : params.url.trim(),
    interest_level: params.interest_level,
    hourly_rate: params.hourly_rate ?? null,
    annual_salary: params.annual_salary ?? null,
  }
}
