/** Erro HTTP da API Rails com `errors` normalizado por campo (snake_case como no JSON). */
export class ApiError extends Error {
  readonly status: number
  readonly fieldErrors: Record<string, string[]>

  constructor(status: number, fieldErrors: Record<string, string[]>) {
    super("api_error")
    this.name = "ApiError"
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

export function normalizeRailsErrors(raw: Record<string, unknown>): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const [key, val] of Object.entries(raw)) {
    if (Array.isArray(val)) {
      out[key] = val.map(String)
    } else if (typeof val === "string") {
      out[key] = [val]
    } else if (val != null && typeof val === "object") {
      out[key] = [JSON.stringify(val)]
    }
  }
  return out
}

export async function parseJsonBody(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return null
  }
}

function fallbackMessageForStatus(status: number): string {
  if (status === 401) return "Não autorizado."
  if (status === 403) return "Acesso negado."
  if (status === 404) return "Recurso não encontrado."
  if (status === 422) return "Não foi possível validar os dados."
  return `Erro HTTP ${status}.`
}

export function apiErrorFromResponse(res: Response, data: unknown): ApiError {
  const body = data as { errors?: Record<string, unknown> } | null
  const raw = body?.errors ?? {}
  const normalized = normalizeRailsErrors(raw)
  if (Object.keys(normalized).length > 0) {
    return new ApiError(res.status, normalized)
  }
  return new ApiError(res.status, {
    base: [fallbackMessageForStatus(res.status)],
  })
}

export function invalidResponseError(): ApiError {
  return new ApiError(500, {
    base: ["Resposta inválida do servidor."],
  })
}
