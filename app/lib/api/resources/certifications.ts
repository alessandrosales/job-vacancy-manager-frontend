import { apiRequestJson, apiRequestNoContent } from "~/lib/api/client"
import type {
  ApiIndexParams,
  PaginatedEnvelope,
} from "~/lib/api/pagination"
import { toIndexQuery } from "~/lib/api/pagination"

export interface ApiCertification {
  id: string
  user_id: string
  name: string
  date_from: string | null
  date_to: string | null
  created_at: string
  updated_at: string
}

export type ApiCertificationWrite = Pick<
  ApiCertification,
  "name" | "date_from" | "date_to"
>

export async function listCertifications(params: {
  paginated: false
}): Promise<ApiCertification[]>
export async function listCertifications(
  params?: { paginated?: true; page?: number; per_page?: number }
): Promise<PaginatedEnvelope<ApiCertification>>
export async function listCertifications(
  params?: ApiIndexParams
): Promise<PaginatedEnvelope<ApiCertification> | ApiCertification[]> {
  const query = toIndexQuery(params)
  if (params?.paginated === false) {
    return apiRequestJson<ApiCertification[]>({
      path: "certifications",
      method: "GET",
      query,
    })
  }
  return apiRequestJson<PaginatedEnvelope<ApiCertification>>({
    path: "certifications",
    method: "GET",
    query,
  })
}

export async function getCertification(id: string): Promise<ApiCertification> {
  return apiRequestJson<ApiCertification>({
    path: `certifications/${encodeURIComponent(id)}`,
    method: "GET",
  })
}

export async function createCertification(
  payload: Partial<ApiCertificationWrite>
): Promise<ApiCertification> {
  return apiRequestJson<ApiCertification>({
    path: "certifications",
    method: "POST",
    body: { certification: payload },
  })
}

export async function updateCertification(
  id: string,
  payload: Partial<ApiCertificationWrite>
): Promise<ApiCertification> {
  return apiRequestJson<ApiCertification>({
    path: `certifications/${encodeURIComponent(id)}`,
    method: "PATCH",
    body: { certification: payload },
  })
}

export async function deleteCertification(id: string): Promise<void> {
  await apiRequestNoContent({
    path: `certifications/${encodeURIComponent(id)}`,
    method: "DELETE",
  })
}
