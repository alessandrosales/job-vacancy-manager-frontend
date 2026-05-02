import { apiRequestJson, apiRequestNoContent } from "~/lib/api/client"

/** Payload JSON de `Opportunity#as_api_json` (Rails). */
export interface ApiOpportunity {
  id: string
  user_id: string
  company_id: string
  role_id: string
  description: string | null
  url: string | null
  status_id: string
  interest_level: number
  hourly_rate: number | null
  annual_salary: number | null
  created_at: string
  updated_at: string
}

export type ApiOpportunityWrite = Pick<
  ApiOpportunity,
  | "company_id"
  | "role_id"
  | "status_id"
  | "description"
  | "url"
  | "interest_level"
  | "hourly_rate"
  | "annual_salary"
>

export async function listOpportunities(): Promise<ApiOpportunity[]> {
  return apiRequestJson<ApiOpportunity[]>({
    path: "opportunities",
    method: "GET",
  })
}

export async function getOpportunity(id: string): Promise<ApiOpportunity> {
  return apiRequestJson<ApiOpportunity>({
    path: `opportunities/${encodeURIComponent(id)}`,
    method: "GET",
  })
}

export async function createOpportunity(
  payload: Partial<ApiOpportunityWrite>
): Promise<ApiOpportunity> {
  return apiRequestJson<ApiOpportunity>({
    path: "opportunities",
    method: "POST",
    body: { opportunity: payload },
  })
}

export async function updateOpportunity(
  id: string,
  payload: Partial<ApiOpportunityWrite>
): Promise<ApiOpportunity> {
  return apiRequestJson<ApiOpportunity>({
    path: `opportunities/${encodeURIComponent(id)}`,
    method: "PATCH",
    body: { opportunity: payload },
  })
}

export async function deleteOpportunity(id: string): Promise<void> {
  await apiRequestNoContent({
    path: `opportunities/${encodeURIComponent(id)}`,
    method: "DELETE",
  })
}
