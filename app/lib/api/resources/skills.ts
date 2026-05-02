import { apiRequestJson, apiRequestNoContent } from "~/lib/api/client"
import type {
  ApiIndexParams,
  PaginatedEnvelope,
} from "~/lib/api/pagination"
import { toIndexQuery } from "~/lib/api/pagination"

export interface ApiSkill {
  id: string
  user_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export type ApiSkillWrite = Pick<ApiSkill, "name" | "description">

export async function listSkills(params: {
  paginated: false
}): Promise<ApiSkill[]>
export async function listSkills(
  params?: { paginated?: true; page?: number; per_page?: number }
): Promise<PaginatedEnvelope<ApiSkill>>
export async function listSkills(
  params?: ApiIndexParams
): Promise<PaginatedEnvelope<ApiSkill> | ApiSkill[]> {
  const query = toIndexQuery(params)
  if (params?.paginated === false) {
    return apiRequestJson<ApiSkill[]>({
      path: "skills",
      method: "GET",
      query,
    })
  }
  return apiRequestJson<PaginatedEnvelope<ApiSkill>>({
    path: "skills",
    method: "GET",
    query,
  })
}

export async function getSkill(id: string): Promise<ApiSkill> {
  return apiRequestJson<ApiSkill>({
    path: `skills/${encodeURIComponent(id)}`,
    method: "GET",
  })
}

export async function createSkill(
  payload: Partial<ApiSkillWrite>
): Promise<ApiSkill> {
  return apiRequestJson<ApiSkill>({
    path: "skills",
    method: "POST",
    body: { skill: payload },
  })
}

export async function updateSkill(
  id: string,
  payload: Partial<ApiSkillWrite>
): Promise<ApiSkill> {
  return apiRequestJson<ApiSkill>({
    path: `skills/${encodeURIComponent(id)}`,
    method: "PATCH",
    body: { skill: payload },
  })
}

export async function deleteSkill(id: string): Promise<void> {
  await apiRequestNoContent({
    path: `skills/${encodeURIComponent(id)}`,
    method: "DELETE",
  })
}
