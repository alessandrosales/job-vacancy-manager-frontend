/** Metadados de `render_paginated` no Rails (`Api::V1::Paginatable`). */
export interface PaginationMeta {
  current_page: number
  per_page: number
  total_pages: number
  total_count: number
}

export interface PaginatedEnvelope<T> {
  data: T[]
  meta: PaginationMeta
}

/**
 * Parâmetros de query para `index` paginado por padrão no backend.
 * Use `{ paginated: false }` para resposta legada em array cru.
 */
export type ApiIndexParams =
  | { paginated: false }
  | { paginated?: true; page?: number; per_page?: number }

export function toIndexQuery(
  params?: ApiIndexParams
): Record<string, string | number | boolean | undefined> | undefined {
  if (!params) return undefined
  if ("paginated" in params && params.paginated === false) {
    return { paginated: false }
  }
  const q: Record<string, string | number | boolean | undefined> = {}
  if ("page" in params && params.page != null) q.page = params.page
  if ("per_page" in params && params.per_page != null) {
    q.per_page = params.per_page
  }
  return Object.keys(q).length > 0 ? q : undefined
}
