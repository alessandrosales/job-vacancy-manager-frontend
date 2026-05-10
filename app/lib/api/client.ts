import { getApiBaseUrl } from "~/lib/api-base-url"
import { getAuthToken } from "~/lib/auth-token"
import { ApiError, apiErrorFromResponse, parseJsonBody } from "~/lib/api/errors"

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

function buildBlobHeaders(
  options: ApiRequestOptions & { accept?: string }
): Headers {
  const headers = new Headers(options.headers)
  headers.set("Accept", options.accept ?? "*/*")
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

/** Extrai nome de arquivo do header `Content-Disposition` (RFC 5987 opcional). */
export function parseContentDispositionFilename(header: string): string | null {
  const star = /filename\*=(?:UTF-8'')?([^;\n]+)/i.exec(header)
  if (star?.[1]) {
    const raw = star[1].trim().replace(/^["']|["']$/g, "")
    try {
      return decodeURIComponent(raw)
    } catch {
      return raw
    }
  }
  const quoted = /filename="([^"]+)"/i.exec(header)
  if (quoted?.[1]) return quoted[1].trim()

  const plain = /filename=([^;\s]+)/i.exec(header)
  if (plain?.[1]) return plain[1].trim().replace(/^["']|["']$/g, "")

  return null
}

export interface ApiBlobResult {
  blob: Blob
  filename: string | null
}

/**
 * Download binário ou texto (attachment): não força `Accept: application/json`.
 * Erros JSON da API viram {@link ApiError}.
 */
export async function apiRequestBlob(
  options: ApiRequestOptions & { accept?: string }
): Promise<ApiBlobResult> {
  const method = options.method ?? "GET"
  const url = buildUrl(options.path, options.query)
  const headers = buildBlobHeaders(options)

  const res = await fetch(url, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })

  if (!res.ok) {
    const data = await parseJsonBody(res)
    throw apiErrorFromResponse(res, data)
  }

  const blob = await res.blob()
  const cd = res.headers.get("Content-Disposition")
  const filename = cd ? parseContentDispositionFilename(cd) : null
  return { blob, filename }
}

/**
 * Requisição JSON genérica: retorna o corpo parseado em sucesso (2xx).
 * Erros Rails (`{ errors: { ... } }`) viram {@link ApiError}.
 */
export async function apiRequestJson<T>(
  options: ApiRequestOptions
): Promise<T> {
  const method = options.method ?? "GET"
  const url = buildUrl(options.path, options.query)
  const headers = buildHeaders(options)

  const res = await fetch(url, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })

  const data = await parseJsonBody(res)

  if (!res.ok) {
    throw apiErrorFromResponse(res, data)
  }

  return data as T
}

/**
 * POST multipart (`FormData`): não define `Content-Type` para o browser incluir o boundary.
 * Resposta JSON em sucesso; erros Rails viram {@link ApiError}.
 */
export async function apiRequestMultipartJson<T>(options: {
  path: string
  method?: HttpMethod
  formData: FormData
  auth?: boolean
  signal?: AbortSignal
}): Promise<T> {
  const method = options.method ?? "POST"
  const url = buildUrl(options.path, undefined)
  const headers = new Headers()
  headers.set("Accept", "application/json")
  const sendAuth = options.auth !== false
  if (sendAuth) {
    const token = getAuthToken()
    if (token) headers.set("Authorization", `Bearer ${token}`)
  }

  const res = await fetch(url, {
    method,
    headers,
    body: options.formData,
    signal: options.signal,
  })

  const data = await parseJsonBody(res)

  if (!res.ok) {
    throw apiErrorFromResponse(res, data)
  }

  return data as T
}

/** Para respostas sem corpo (`204 No Content` ou corpo vazio). */
export async function apiRequestNoContent(
  options: ApiRequestOptions
): Promise<void> {
  const method = options.method ?? "GET"
  const url = buildUrl(options.path, options.query)
  const headers = buildHeaders(options)

  const res = await fetch(url, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
  })

  const data = await parseJsonBody(res)

  if (!res.ok) {
    throw apiErrorFromResponse(res, data)
  }
}
