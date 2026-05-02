import { apiRequestJson } from "~/lib/api/client"
import { ApiError, invalidResponseError } from "~/lib/api/errors"

/** Usuário como retornado por `User#as_api_json` (Rails). */
export interface ApiSessionUser {
  id: string
  name: string
  email: string
  created_at: string
  updated_at: string
}

/** Resposta de login, registro ou troca de senha com JWT. */
export interface AuthSessionPayload {
  token: string
  user: ApiSessionUser
}

export function parseAuthSessionPayload(data: unknown): AuthSessionPayload {
  const o = data as Partial<AuthSessionPayload> | null
  if (
    !o ||
    typeof o.token !== "string" ||
    !o.user ||
    typeof o.user.email !== "string"
  ) {
    throw invalidResponseError()
  }
  return o as AuthSessionPayload
}

export async function registerWithEmail(params: {
  name: string
  email: string
  password: string
  password_confirmation: string
}): Promise<AuthSessionPayload> {
  const data = await apiRequestJson<unknown>({
    path: "auth/register",
    method: "POST",
    auth: false,
    body: {
      auth: {
        name: params.name,
        email: params.email,
        password: params.password,
        password_confirmation: params.password_confirmation,
      },
    },
  })
  return parseAuthSessionPayload(data)
}

export async function loginWithEmail(params: {
  email: string
  password: string
}): Promise<AuthSessionPayload> {
  try {
    const data = await apiRequestJson<unknown>({
      path: "auth/login",
      method: "POST",
      auth: false,
      body: {
        auth: {
          email: params.email.trim(),
          password: params.password,
        },
      },
    })
    return parseAuthSessionPayload(data)
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      throw new ApiError(401, {
        base: ["E-mail ou senha incorretos."],
      })
    }
    throw e
  }
}

/** Usuário atual a partir do JWT (`GET /api/v1/auth/me`). */
export async function fetchAuthMe(): Promise<ApiSessionUser> {
  const data = await apiRequestJson<unknown>({
    path: "auth/me",
    method: "GET",
  })
  const u = data as Partial<ApiSessionUser> | null
  if (
    !u ||
    typeof u.id !== "string" ||
    typeof u.email !== "string" ||
    typeof u.name !== "string"
  ) {
    throw invalidResponseError()
  }
  return u as ApiSessionUser
}
