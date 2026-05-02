import type { KanbanCustomColumn, Opportunity } from "~/components/providers/app-data-provider"
import type { OpportunityStatusDefinition } from "~/lib/labels"

export const COLUMN_DROPPABLE_PREFIX = "column:" as const
export const COLUMN_SORTABLE_PREFIX = "column-sort:" as const

export function columnDroppableId(columnId: string): string {
  return `${COLUMN_DROPPABLE_PREFIX}${columnId}`
}

export function parseColumnDroppableId(droppableId: string): string | null {
  if (!droppableId.startsWith(COLUMN_DROPPABLE_PREFIX)) return null
  return droppableId.slice(COLUMN_DROPPABLE_PREFIX.length)
}

export function columnSortableId(columnId: string): string {
  return `${COLUMN_SORTABLE_PREFIX}${columnId}`
}

export function parseColumnSortableId(id: string): string | null {
  if (!id.startsWith(COLUMN_SORTABLE_PREFIX)) return null
  return id.slice(COLUMN_SORTABLE_PREFIX.length)
}

export function getEffectiveColumnId(opp: Opportunity): string {
  return opp.board_column_id ?? opp.status
}

export function isOpportunityStatusColumnId(
  columnId: string,
  opportunityStatuses: readonly OpportunityStatusDefinition[]
): boolean {
  return opportunityStatuses.some((s) => s.id === columnId)
}

/** Ordem de exibição alinhada a `opportunity_statuses.position` (API / provider). */
export function sortOpportunityStatusesByPosition(
  opportunityStatuses: readonly OpportunityStatusDefinition[]
): OpportunityStatusDefinition[] {
  return [...opportunityStatuses].sort((a, b) => {
    const pa = a.position ?? 0
    const pb = b.position ?? 0
    if (pa !== pb) return pa - pb
    return String(a.id).localeCompare(String(b.id))
  })
}

export function getOrderedKanbanColumnIds(
  opportunityStatuses: readonly OpportunityStatusDefinition[],
  customColumns: readonly KanbanCustomColumn[]
): string[] {
  const sortedStatuses = sortOpportunityStatusesByPosition(opportunityStatuses)
  return [...sortedStatuses.map((s) => s.id), ...customColumns.map((c) => c.id)]
}

export function applyPersistedColumnOrder(
  canonicalColumnIds: readonly string[],
  persistedOrder: readonly string[]
): string[] {
  if (persistedOrder.length === 0) return [...canonicalColumnIds]
  const canonicalSet = new Set(canonicalColumnIds)
  const ordered = persistedOrder.filter((id) => canonicalSet.has(id))
  for (const id of canonicalColumnIds) {
    if (!ordered.includes(id)) ordered.push(id)
  }
  return ordered
}

export function getColumnTitle(
  columnId: string,
  opportunityStatuses: readonly OpportunityStatusDefinition[],
  customColumns: readonly KanbanCustomColumn[]
): string {
  const st = opportunityStatuses.find((s) => s.id === columnId)
  if (st) return st.label
  const c = customColumns.find((x) => x.id === columnId)
  return c?.title ?? columnId
}

export function getColumnBadgeProps(
  columnId: string,
  opportunityStatuses: readonly OpportunityStatusDefinition[],
  customColumns: readonly KanbanCustomColumn[]
): { label: string; variant: "secondary" | "outline" | "default" | "destructive" } {
  const st = opportunityStatuses.find((s) => s.id === columnId)
  if (st) {
    return { label: st.label, variant: st.variant }
  }
  return {
    label: getColumnTitle(columnId, opportunityStatuses, customColumns),
    variant: "outline",
  }
}

/** Ordenação no cliente: prioriza `updated_at`, depois `created_at` (ISO da API). */
function opportunityRecencyMs(o: Opportunity): number {
  const candidates = [o.updated_at, o.created_at]
  for (const raw of candidates) {
    if (raw == null || raw === "") continue
    const t = Date.parse(raw)
    if (Number.isFinite(t)) return t
  }
  return 0
}

/** Mais recente primeiro (`updated_at`, senão `created_at`). */
export function sortOpportunitiesByUpdatedAtDesc(
  rows: readonly Opportunity[]
): Opportunity[] {
  return [...rows].sort((a, b) => {
    const tb = opportunityRecencyMs(b)
    const ta = opportunityRecencyMs(a)
    if (tb !== ta) return tb - ta
    return String(b.id).localeCompare(String(a.id))
  })
}

export function itemsByColumnFromOpportunities(
  rows: readonly Opportunity[],
  columnIds: readonly string[],
  opportunityStatuses: readonly OpportunityStatusDefinition[],
  options?: {
    /** Só colunas de status: cada card vai para `opp.status` (ignora `board_column_id`). */
    assignColumnByStatusOnly?: boolean
  }
): Record<string, string[]> {
  const sortedRows = sortOpportunitiesByUpdatedAtDesc(rows)
  const next: Record<string, string[]> = {}
  for (const id of columnIds) {
    next[id] = []
  }
  const fallback =
    columnIds[0] ?? opportunityStatuses[0]?.id ?? ""
  for (const o of sortedRows) {
    const col = options?.assignColumnByStatusOnly
      ? o.status
      : getEffectiveColumnId(o)
    if (Object.prototype.hasOwnProperty.call(next, col)) {
      next[col].push(o.id)
    } else {
      if (!Object.prototype.hasOwnProperty.call(next, fallback)) {
        next[fallback] = []
      }
      next[fallback].push(o.id)
    }
  }
  return next
}

export function findColumnForItemId(
  itemId: string,
  items: Record<string, string[]>
): string | undefined {
  for (const [columnId, ids] of Object.entries(items)) {
    if (ids.includes(itemId)) return columnId
  }
  return undefined
}

export function resolveOverColumn(
  overId: string,
  items: Record<string, string[]>
): string | undefined {
  const fromDroppable = parseColumnDroppableId(overId)
  if (fromDroppable && Object.prototype.hasOwnProperty.call(items, fromDroppable)) {
    return fromDroppable
  }
  return findColumnForItemId(overId, items)
}
