import { apiRequestJson, apiRequestNoContent } from "~/lib/api/client"
import type { ApiIndexParams, PaginatedEnvelope } from "~/lib/api/pagination"
import { toIndexQuery } from "~/lib/api/pagination"

const BASE = "opportunity-statuses"

/** Valores permitidos por `OpportunityStatus::BADGE_VARIANTS` (Rails). */
export type ApiOpportunityStatusVariant =
  | "secondary"
  | "outline"
  | "default"
  | "destructive"

export interface ApiOpportunityStatus {
  id: string
  user_id: string
  label: string
  description: string | null
  variant: ApiOpportunityStatusVariant
  position: number
  created_at: string
  updated_at: string
}

export type ApiOpportunityStatusWrite = Pick<
  ApiOpportunityStatus,
  "label" | "description" | "variant" | "position"
>

export async function listOpportunityStatuses(params: {
  paginated: false
}): Promise<ApiOpportunityStatus[]>
export async function listOpportunityStatuses(params?: {
  paginated?: true
  page?: number
  per_page?: number
}): Promise<PaginatedEnvelope<ApiOpportunityStatus>>
export async function listOpportunityStatuses(
  params?: ApiIndexParams
): Promise<PaginatedEnvelope<ApiOpportunityStatus> | ApiOpportunityStatus[]> {
  const query = toIndexQuery(params)
  if (params?.paginated === false) {
    return apiRequestJson<ApiOpportunityStatus[]>({
      path: BASE,
      method: "GET",
      query,
    })
  }
  return apiRequestJson<PaginatedEnvelope<ApiOpportunityStatus>>({
    path: BASE,
    method: "GET",
    query,
  })
}

export async function getOpportunityStatus(
  id: string
): Promise<ApiOpportunityStatus> {
  return apiRequestJson<ApiOpportunityStatus>({
    path: `${BASE}/${encodeURIComponent(id)}`,
    method: "GET",
  })
}

export async function createOpportunityStatus(
  payload: Partial<ApiOpportunityStatusWrite>
): Promise<ApiOpportunityStatus> {
  return apiRequestJson<ApiOpportunityStatus>({
    path: BASE,
    method: "POST",
    body: { opportunity_status: payload },
  })
}

export async function updateOpportunityStatus(
  id: string,
  payload: Partial<ApiOpportunityStatusWrite>
): Promise<ApiOpportunityStatus> {
  return apiRequestJson<ApiOpportunityStatus>({
    path: `${BASE}/${encodeURIComponent(id)}`,
    method: "PATCH",
    body: { opportunity_status: payload },
  })
}

/** Pode responder `422` se o registro não puder ser excluído (ex.: oportunidades ligadas). */
export async function deleteOpportunityStatus(id: string): Promise<void> {
  await apiRequestNoContent({
    path: `${BASE}/${encodeURIComponent(id)}`,
    method: "DELETE",
  })
}
