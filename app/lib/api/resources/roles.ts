import { apiRequestJson, apiRequestNoContent } from "~/lib/api/client"
import type {
  ApiIndexParams,
  PaginatedEnvelope,
} from "~/lib/api/pagination"
import { toIndexQuery } from "~/lib/api/pagination"

export interface ApiRole {
  id: string
  user_id: string
  name: string
  description: string | null
  interest_level: number
  created_at: string
  updated_at: string
}

export type ApiRoleWrite = Pick<
  ApiRole,
  "name" | "description" | "interest_level"
>

export async function listRoles(params: {
  paginated: false
}): Promise<ApiRole[]>
export async function listRoles(
  params?: { paginated?: true; page?: number; per_page?: number }
): Promise<PaginatedEnvelope<ApiRole>>
export async function listRoles(
  params?: ApiIndexParams
): Promise<PaginatedEnvelope<ApiRole> | ApiRole[]> {
  const query = toIndexQuery(params)
  if (params?.paginated === false) {
    return apiRequestJson<ApiRole[]>({
      path: "roles",
      method: "GET",
      query,
    })
  }
  return apiRequestJson<PaginatedEnvelope<ApiRole>>({
    path: "roles",
    method: "GET",
    query,
  })
}

export async function getRole(id: string): Promise<ApiRole> {
  return apiRequestJson<ApiRole>({
    path: `roles/${encodeURIComponent(id)}`,
    method: "GET",
  })
}

export async function createRole(
  payload: Partial<ApiRoleWrite>
): Promise<ApiRole> {
  return apiRequestJson<ApiRole>({
    path: "roles",
    method: "POST",
    body: { role: payload },
  })
}

export async function updateRole(
  id: string,
  payload: Partial<ApiRoleWrite>
): Promise<ApiRole> {
  return apiRequestJson<ApiRole>({
    path: `roles/${encodeURIComponent(id)}`,
    method: "PATCH",
    body: { role: payload },
  })
}

export async function deleteRole(id: string): Promise<void> {
  await apiRequestNoContent({
    path: `roles/${encodeURIComponent(id)}`,
    method: "DELETE",
  })
}
