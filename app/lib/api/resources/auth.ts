import { apiRequestJson } from "~/lib/api/client"
import { ApiError, invalidResponseError } from "~/lib/api/errors"

/** Usuário como retornado por `User#as_api_json` (Rails). */
export interface ApiSessionUser {
  id: string
  name: string
  email: string
  phone: string | null
  avatar_url: string | null
  bio: string | null
  age: number | null
  full_address: string | null
  relationship_status: string | null
  gender: string | null
  /** Preferência de idioma da UI: `en` | `pt_br` | `es`. */
  preferred_language: string
  created_at: string
  updated_at: string
}

function optionalApiString(o: Record<string, unknown>, key: string): string | null {
  const v = o[key]
  if (v === undefined || v === null) return null
  if (typeof v !== "string") throw invalidResponseError()
  return v
}

/** Valida o JSON de usuário retornado por login, registro, `/auth/me` ou `PATCH /users/:id`. */
export function parseApiSessionUser(data: unknown): ApiSessionUser {
  const o = data as Record<string, unknown> | null
  if (
    !o ||
    typeof o.id !== "string" ||
    typeof o.email !== "string" ||
    typeof o.name !== "string" ||
    typeof o.created_at !== "string" ||
    typeof o.updated_at !== "string"
  ) {
    throw invalidResponseError()
  }

  let age: number | null = null
  if (o.age !== undefined && o.age !== null) {
    if (typeof o.age !== "number" || !Number.isInteger(o.age)) {
      throw invalidResponseError()
    }
    age = o.age
  }

  const preferredRaw = o.preferred_language
  const preferred_language =
    typeof preferredRaw === "string" &&
    (preferredRaw === "en" || preferredRaw === "pt_br" || preferredRaw === "es")
      ? preferredRaw
      : preferredRaw === "pt-br"
        ? "pt_br"
        : "en"

  return {
    id: o.id,
    name: o.name,
    email: o.email,
    phone: optionalApiString(o, "phone"),
    avatar_url: optionalApiString(o, "avatar_url"),
    bio: optionalApiString(o, "bio"),
    age,
    full_address: optionalApiString(o, "full_address"),
    relationship_status: optionalApiString(o, "relationship_status"),
    gender: optionalApiString(o, "gender"),
    preferred_language,
    created_at: o.created_at,
    updated_at: o.updated_at,
  }
}

/** Resposta de login, registro ou troca de senha com JWT. */
export interface AuthSessionPayload {
  token: string
  user: ApiSessionUser
}

export function parseAuthSessionPayload(data: unknown): AuthSessionPayload {
  const o = data as Partial<{ token: unknown; user: unknown }> | null
  if (!o || typeof o.token !== "string" || o.user === undefined) {
    throw invalidResponseError()
  }
  return { token: o.token, user: parseApiSessionUser(o.user) }
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

export async function loginWithFirebaseIdToken(
  id_token: string
): Promise<AuthSessionPayload> {
  try {
    const data = await apiRequestJson<unknown>({
      path: "auth/firebase",
      method: "POST",
      auth: false,
      body: {
        auth: { id_token },
      },
    })
    return parseAuthSessionPayload(data)
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) {
      throw new ApiError(401, {
        base: ["Invalid Firebase session. Please sign in again."],
      })
    }
    throw e
  }
}

/** Usuário atual a partir do JWT (`GET /api/v1/auth/me`). */
export async function fetchAuthMe(options?: {
  signal?: AbortSignal
}): Promise<ApiSessionUser> {
  const data = await apiRequestJson<unknown>({
    path: "auth/me",
    method: "GET",
    signal: options?.signal,
  })
  return parseApiSessionUser(data)
}
