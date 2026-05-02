import { apiRequestJson, apiRequestNoContent } from "~/lib/api/client"

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

export async function listRoles(): Promise<ApiRole[]> {
  return apiRequestJson<ApiRole[]>({
    path: "roles",
    method: "GET",
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
