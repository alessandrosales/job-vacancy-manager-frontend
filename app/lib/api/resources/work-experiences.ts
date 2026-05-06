import { apiRequestJson, apiRequestNoContent } from "~/lib/api/client"
import type {
  ApiIndexParams,
  PaginatedEnvelope,
} from "~/lib/api/pagination"
import { toIndexQuery } from "~/lib/api/pagination"
import type { ApiSkill } from "~/lib/api/resources/skills"

const BASE = "work-experiences"

export interface ApiWorkExperience {
  id: string
  user_id: string
  title: string
  /** Responsabilidades ou realizações na função (texto longo; opcional). */
  description: string | null
  company_name: string
  is_remote: boolean
  date_from: string | null
  date_to: string | null
  /** Ordem alinhada a `work_experience_skills.created_at` (Rails). */
  skill_ids: string[]
  created_at: string
  updated_at: string
}

export type ApiWorkExperienceWrite = Pick<
  ApiWorkExperience,
  "title" | "description" | "company_name" | "is_remote" | "date_from" | "date_to"
>

export async function listWorkExperiences(params: {
  paginated: false
}): Promise<ApiWorkExperience[]>
export async function listWorkExperiences(
  params?: { paginated?: true; page?: number; per_page?: number }
): Promise<PaginatedEnvelope<ApiWorkExperience>>
export async function listWorkExperiences(
  params?: ApiIndexParams
): Promise<PaginatedEnvelope<ApiWorkExperience> | ApiWorkExperience[]> {
  const query = toIndexQuery(params)
  if (params?.paginated === false) {
    return apiRequestJson<ApiWorkExperience[]>({
      path: BASE,
      method: "GET",
      query,
    })
  }
  return apiRequestJson<PaginatedEnvelope<ApiWorkExperience>>({
    path: BASE,
    method: "GET",
    query,
  })
}

export async function getWorkExperience(id: string): Promise<ApiWorkExperience> {
  return apiRequestJson<ApiWorkExperience>({
    path: `${BASE}/${encodeURIComponent(id)}`,
    method: "GET",
  })
}

export async function createWorkExperience(
  payload: Partial<ApiWorkExperienceWrite>
): Promise<ApiWorkExperience> {
  return apiRequestJson<ApiWorkExperience>({
    path: BASE,
    method: "POST",
    body: { work_experience: payload },
  })
}

export async function updateWorkExperience(
  id: string,
  payload: Partial<ApiWorkExperienceWrite>
): Promise<ApiWorkExperience> {
  return apiRequestJson<ApiWorkExperience>({
    path: `${BASE}/${encodeURIComponent(id)}`,
    method: "PATCH",
    body: { work_experience: payload },
  })
}

export async function deleteWorkExperience(id: string): Promise<void> {
  await apiRequestNoContent({
    path: `${BASE}/${encodeURIComponent(id)}`,
    method: "DELETE",
  })
}

/** Substitui vínculos de skills na experiência (ordem preservada na resposta). */
export async function syncWorkExperienceSkills(
  workExperienceId: string,
  skill_ids: string[]
): Promise<ApiSkill[]> {
  return apiRequestJson<ApiSkill[]>({
    path: `${BASE}/${encodeURIComponent(workExperienceId)}/skills`,
    method: "PATCH",
    body: {
      work_experience_skill: { skill_ids },
    },
  })
}
