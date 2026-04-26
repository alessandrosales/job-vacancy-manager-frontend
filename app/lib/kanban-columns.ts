import type { KanbanCustomColumn, Opportunity } from "~/components/providers/app-data-provider"
import {
  OPPORTUNITY_STATUS_OPTIONS,
  statusBadge,
  type OpportunityStatus,
} from "~/lib/labels"

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
  return opp.boardColumnId ?? opp.status
}

export function isBuiltInColumnId(id: string): id is OpportunityStatus {
  return OPPORTUNITY_STATUS_OPTIONS.includes(id as OpportunityStatus)
}

export function getOrderedKanbanColumnIds(
  customColumns: readonly KanbanCustomColumn[]
): string[] {
  return [...OPPORTUNITY_STATUS_OPTIONS, ...customColumns.map((c) => c.id)]
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
  customColumns: readonly KanbanCustomColumn[]
): string {
  if (isBuiltInColumnId(columnId)) {
    return statusBadge[columnId].label
  }
  const c = customColumns.find((x) => x.id === columnId)
  return c?.title ?? columnId
}

export function getColumnBadgeProps(
  columnId: string,
  customColumns: readonly KanbanCustomColumn[]
): { label: string; variant: "secondary" | "outline" | "default" | "destructive" } {
  if (isBuiltInColumnId(columnId)) {
    return statusBadge[columnId]
  }
  return { label: getColumnTitle(columnId, customColumns), variant: "outline" }
}

export function itemsByColumnFromOpportunities(
  rows: readonly Opportunity[],
  columnIds: readonly string[]
): Record<string, string[]> {
  const next: Record<string, string[]> = {}
  for (const id of columnIds) {
    next[id] = []
  }
  const fallback = columnIds[0] ?? OPPORTUNITY_STATUS_OPTIONS[0]!
  for (const o of rows) {
    const col = getEffectiveColumnId(o)
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
