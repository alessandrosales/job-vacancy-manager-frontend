import { apiRequestJson, apiRequestNoContent } from "~/lib/api/client"

const BASE = "reference-links"

export interface ApiReferenceLink {
  id: string
  user_id: string
  title: string
  url: string
  created_at: string
  updated_at: string
}

export type ApiReferenceLinkWrite = Pick<ApiReferenceLink, "title" | "url">

export async function listReferenceLinks(): Promise<ApiReferenceLink[]> {
  return apiRequestJson<ApiReferenceLink[]>({
    path: BASE,
    method: "GET",
  })
}

export async function getReferenceLink(id: string): Promise<ApiReferenceLink> {
  return apiRequestJson<ApiReferenceLink>({
    path: `${BASE}/${encodeURIComponent(id)}`,
    method: "GET",
  })
}

export async function createReferenceLink(
  payload: Partial<ApiReferenceLinkWrite>
): Promise<ApiReferenceLink> {
  return apiRequestJson<ApiReferenceLink>({
    path: BASE,
    method: "POST",
    body: { reference_link: payload },
  })
}

export async function updateReferenceLink(
  id: string,
  payload: Partial<ApiReferenceLinkWrite>
): Promise<ApiReferenceLink> {
  return apiRequestJson<ApiReferenceLink>({
    path: `${BASE}/${encodeURIComponent(id)}`,
    method: "PATCH",
    body: { reference_link: payload },
  })
}

export async function deleteReferenceLink(id: string): Promise<void> {
  await apiRequestNoContent({
    path: `${BASE}/${encodeURIComponent(id)}`,
    method: "DELETE",
  })
}
