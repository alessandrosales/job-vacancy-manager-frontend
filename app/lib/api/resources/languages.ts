import { apiRequestJson, apiRequestNoContent } from "~/lib/api/client"
import type {
  ApiIndexParams,
  PaginatedEnvelope,
} from "~/lib/api/pagination"
import { toIndexQuery } from "~/lib/api/pagination"

export type LanguageLevel = "beginner" | "intermediate" | "advanced" | "native"

export interface ApiLanguage {
  id: string
  user_id: string
  name: string
  level: LanguageLevel
  created_at: string
  updated_at: string
}

export type ApiLanguageWrite = Pick<ApiLanguage, "name" | "level">

export async function listLanguages(params: {
  paginated: false
}): Promise<ApiLanguage[]>
export async function listLanguages(
  params?: { paginated?: true; page?: number; per_page?: number }
): Promise<PaginatedEnvelope<ApiLanguage>>
export async function listLanguages(
  params?: ApiIndexParams
): Promise<PaginatedEnvelope<ApiLanguage> | ApiLanguage[]> {
  const query = toIndexQuery(params)
  if (params?.paginated === false) {
    return apiRequestJson<ApiLanguage[]>({
      path: "languages",
      method: "GET",
      query,
    })
  }
  return apiRequestJson<PaginatedEnvelope<ApiLanguage>>({
    path: "languages",
    method: "GET",
    query,
  })
}

export async function getLanguage(id: string): Promise<ApiLanguage> {
  return apiRequestJson<ApiLanguage>({
    path: `languages/${encodeURIComponent(id)}`,
    method: "GET",
  })
}

export async function createLanguage(
  payload: Partial<ApiLanguageWrite>
): Promise<ApiLanguage> {
  return apiRequestJson<ApiLanguage>({
    path: "languages",
    method: "POST",
    body: { language: payload },
  })
}

export async function updateLanguage(
  id: string,
  payload: Partial<ApiLanguageWrite>
): Promise<ApiLanguage> {
  return apiRequestJson<ApiLanguage>({
    path: `languages/${encodeURIComponent(id)}`,
    method: "PATCH",
    body: { language: payload },
  })
}

export async function deleteLanguage(id: string): Promise<void> {
  await apiRequestNoContent({
    path: `languages/${encodeURIComponent(id)}`,
    method: "DELETE",
  })
}
