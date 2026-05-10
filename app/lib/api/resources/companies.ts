import { apiRequestJson, apiRequestNoContent } from "~/lib/api/client"
import type { ApiIndexParams, PaginatedEnvelope } from "~/lib/api/pagination"
import { toIndexQuery } from "~/lib/api/pagination"

export interface ApiCompany {
  id: string
  user_id: string
  name: string
  url: string | null
  description: string | null
  interest_level: number
  created_at: string
  updated_at: string
}

export type ApiCompanyWrite = Pick<
  ApiCompany,
  "name" | "url" | "description" | "interest_level"
>

export async function listCompanies(params: {
  paginated: false
}): Promise<ApiCompany[]>
export async function listCompanies(params?: {
  paginated?: true
  page?: number
  per_page?: number
}): Promise<PaginatedEnvelope<ApiCompany>>
export async function listCompanies(
  params?: ApiIndexParams
): Promise<PaginatedEnvelope<ApiCompany> | ApiCompany[]> {
  const query = toIndexQuery(params)
  if (params?.paginated === false) {
    return apiRequestJson<ApiCompany[]>({
      path: "companies",
      method: "GET",
      query,
    })
  }
  return apiRequestJson<PaginatedEnvelope<ApiCompany>>({
    path: "companies",
    method: "GET",
    query,
  })
}

export async function getCompany(id: string): Promise<ApiCompany> {
  return apiRequestJson<ApiCompany>({
    path: `companies/${encodeURIComponent(id)}`,
    method: "GET",
  })
}

export async function createCompany(
  payload: Partial<ApiCompanyWrite>
): Promise<ApiCompany> {
  return apiRequestJson<ApiCompany>({
    path: "companies",
    method: "POST",
    body: { company: payload },
  })
}

export async function updateCompany(
  id: string,
  payload: Partial<ApiCompanyWrite>
): Promise<ApiCompany> {
  return apiRequestJson<ApiCompany>({
    path: `companies/${encodeURIComponent(id)}`,
    method: "PATCH",
    body: { company: payload },
  })
}

export async function deleteCompany(id: string): Promise<void> {
  await apiRequestNoContent({
    path: `companies/${encodeURIComponent(id)}`,
    method: "DELETE",
  })
}
