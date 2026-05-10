import { apiRequestJson, apiRequestNoContent } from "~/lib/api/client"
import type { ApiIndexParams, PaginatedEnvelope } from "~/lib/api/pagination"
import { toIndexQuery } from "~/lib/api/pagination"
import type { ApiSessionUser } from "~/lib/api/resources/auth"

/** Igual a `User#as_api_json`. */
export type ApiUser = ApiSessionUser

export type ApiUserCreate = {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export type ApiUserUpdate = Partial<{
  name: string
  email: string
  password: string
  password_confirmation: string
  phone: string
  avatar_url: string
  bio: string
  /** Enviar `null` para limpar no Rails. */
  age: number | null
  full_address: string
  relationship_status: string
  gender: string
  preferred_language: string
  /** Novo valor do token da OpenAI; string vazia remove a chave salva. Omita para não alterar. */
  ai_token: string
}>

/** Lista contém apenas o usuário autenticado. */
export async function listUsers(params: {
  paginated: false
}): Promise<ApiUser[]>
export async function listUsers(params?: {
  paginated?: true
  page?: number
  per_page?: number
}): Promise<PaginatedEnvelope<ApiUser>>
export async function listUsers(
  params?: ApiIndexParams
): Promise<PaginatedEnvelope<ApiUser> | ApiUser[]> {
  const query = toIndexQuery(params)
  if (params?.paginated === false) {
    return apiRequestJson<ApiUser[]>({
      path: "users",
      method: "GET",
      query,
    })
  }
  return apiRequestJson<PaginatedEnvelope<ApiUser>>({
    path: "users",
    method: "GET",
    query,
  })
}

export async function getUser(id: string): Promise<ApiUser> {
  return apiRequestJson<ApiUser>({
    path: `users/${encodeURIComponent(id)}`,
    method: "GET",
  })
}

/** Público (`skip_before_action :authenticate_request!` no Rails). */
export async function createUser(payload: ApiUserCreate): Promise<ApiUser> {
  return apiRequestJson<ApiUser>({
    path: "users",
    method: "POST",
    auth: false,
    body: { user: payload },
  })
}

export async function updateUser(
  id: string,
  payload: ApiUserUpdate
): Promise<ApiUser> {
  return apiRequestJson<ApiUser>({
    path: `users/${encodeURIComponent(id)}`,
    method: "PATCH",
    body: { user: payload },
  })
}

export async function deleteUser(id: string): Promise<void> {
  await apiRequestNoContent({
    path: `users/${encodeURIComponent(id)}`,
    method: "DELETE",
  })
}
