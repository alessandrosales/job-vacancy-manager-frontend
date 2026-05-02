import { getApiBaseUrl } from "~/lib/api-base-url"
import { getAuthToken } from "~/lib/auth-token"
import {
  ApiError,
  apiErrorFromResponse,
  parseJsonBody,
} from "~/lib/api/errors"

export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE"

export interface ApiRequestOptions {
  /** Caminho após `/api/v1/` (ex.: `auth/login`, `opportunities`). */
  path: string
  /** Query string (chaves snake_case alinhadas aos `params` Rails). */
  query?: Record<string, string | number | boolean | undefined>
  method?: HttpMethod
  /** Corpo JSON (objeto será serializado). Omitir em GET. */
  body?: unknown
  /**
   * Quando `true`, envia `Authorization: Bearer` se existir token.
   * Endpoints públicos (login, registro, etc.) devem usar `false`.
   * @default true
   */
  auth?: boolean
  headers?: HeadersInit
  signal?: AbortSignal
}

function appendQueryToPath(
  path: string,
  query?: Record<string, string | number | boolean | undefined>
): string {
  if (!query) return path
  const entries = Object.entries(query).filter(([, v]) => v !== undefined)
  if (entries.length === 0) return path
  const search = new URLSearchParams()
  for (const [key, value] of entries) {
    search.set(key, String(value))
  }
  const q = search.toString()
  const sep = path.includes("?") ? "&" : "?"
  return `${path}${sep}${q}`
}

function buildUrl(
  path: string,
  query?: Record<string, string | number | boolean | undefined>
): string {
  const base = getApiBaseUrl().replace(/\/$/, "")
  const suffix = path.replace(/^\//, "")
  return appendQueryToPath(`${base}/api/v1/${suffix}`, query)
}

function buildHeaders(options: ApiRequestOptions): Headers {
  const headers = new Headers(options.headers)
  headers.set("Accept", "application/json")
  const sendAuth = options.auth !== false
  if (sendAuth) {
    const token = getAuthToken()
    if (token) headers.set("Authorization", `Bearer ${token}`)
  }
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json")
  }
  return headers
}

/**
 * Requisição JSON genérica: retorna o corpo parseado em sucesso (2xx).
 * Erros Rails (`{ errors: { ... } }`) viram {@link ApiError}.
 */
export async function apiRequestJson<T>(options: ApiRequestOptions): Promise<T> {
  const method = options.method ?? "GET"
  const url = buildUrl(options.path, options.query)
  const headers = buildHeaders(options)

  const res = await fetch(url, {
    method,
    headers,
    body:
      options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })

  const data = await parseJsonBody(res)

  if (!res.ok) {
    throw apiErrorFromResponse(res, data)
  }

  return data as T
}

/** Para respostas sem corpo (`204 No Content` ou corpo vazio). */
export async function apiRequestNoContent(options: ApiRequestOptions): Promise<void> {
  const method = options.method ?? "GET"
  const url = buildUrl(options.path, options.query)
  const headers = buildHeaders(options)

  const res = await fetch(url, {
    method,
    headers,
    body:
      options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })

  const data = await parseJsonBody(res)

  if (!res.ok) {
    throw apiErrorFromResponse(res, data)
  }
}
