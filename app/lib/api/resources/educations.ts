import { apiRequestJson, apiRequestNoContent } from "~/lib/api/client"
import type { ApiIndexParams, PaginatedEnvelope } from "~/lib/api/pagination"
import { toIndexQuery } from "~/lib/api/pagination"

export interface ApiEducation {
  id: string
  user_id: string
  institution_name: string
  degree: string | null
  field_of_study: string | null
  date_from: string | null
  date_to: string | null
  created_at: string
  updated_at: string
}

export type ApiEducationWrite = Pick<
  ApiEducation,
  "institution_name" | "degree" | "field_of_study" | "date_from" | "date_to"
>

export async function listEducations(params: {
  paginated: false
}): Promise<ApiEducation[]>
export async function listEducations(params?: {
  paginated?: true
  page?: number
  per_page?: number
}): Promise<PaginatedEnvelope<ApiEducation>>
export async function listEducations(
  params?: ApiIndexParams
): Promise<PaginatedEnvelope<ApiEducation> | ApiEducation[]> {
  const query = toIndexQuery(params)
  if (params?.paginated === false) {
    return apiRequestJson<ApiEducation[]>({
      path: "educations",
      method: "GET",
      query,
    })
  }
  return apiRequestJson<PaginatedEnvelope<ApiEducation>>({
    path: "educations",
    method: "GET",
    query,
  })
}

export async function getEducation(id: string): Promise<ApiEducation> {
  return apiRequestJson<ApiEducation>({
    path: `educations/${encodeURIComponent(id)}`,
    method: "GET",
  })
}

export async function createEducation(
  payload: Partial<ApiEducationWrite>
): Promise<ApiEducation> {
  return apiRequestJson<ApiEducation>({
    path: "educations",
    method: "POST",
    body: { education: payload },
  })
}

export async function updateEducation(
  id: string,
  payload: Partial<ApiEducationWrite>
): Promise<ApiEducation> {
  return apiRequestJson<ApiEducation>({
    path: `educations/${encodeURIComponent(id)}`,
    method: "PATCH",
    body: { education: payload },
  })
}

export async function deleteEducation(id: string): Promise<void> {
  await apiRequestNoContent({
    path: `educations/${encodeURIComponent(id)}`,
    method: "DELETE",
  })
}
