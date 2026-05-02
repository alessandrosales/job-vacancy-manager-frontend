"use client"

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MeasuringStrategy,
  PointerSensor,
  TouchSensor,
  closestCorners,
  getFirstCollision,
  pointerWithin,
  rectIntersection,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragCancelEvent,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import { restrictToWindowEdges, snapCenterToCursor } from "@dnd-kit/modifiers"
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

import { apiFormErrorFromUnknown } from "~/components/opportunities/quick-add/api-form-error"
import { KanbanColumn } from "~/components/opportunities/kanban/kanban-column"
import { KanbanJobCardContent } from "~/components/opportunities/kanban/kanban-job-card"
import type {
  Company,
  KanbanCustomColumn,
  Opportunity,
  Role,
} from "~/components/providers/app-data-provider"
import type { OpportunityStatusDefinition } from "~/lib/labels"
import { createOpportunityStatus } from "~/lib/api/resources/opportunity-statuses"
import { Input } from "~/components/ui/input"
import {
  applyPersistedColumnOrder,
  columnSortableId,
  findColumnForItemId,
  getColumnTitle,
  getEffectiveColumnId,
  getOrderedKanbanColumnIds,
  isOpportunityStatusColumnId,
  itemsByColumnFromOpportunities,
  parseColumnDroppableId,
  parseColumnSortableId,
  resolveOverColumn,
} from "~/lib/kanban-columns"

const KANBAN_COLUMN_PAGE_SIZE = 24

function persistColumnIfNeeded(
  next: Record<string, string[]>,
  opportunityById: Map<string, Opportunity>,
  opportunityStatuses: readonly OpportunityStatusDefinition[],
  updateOpportunity: (id: string, row: Omit<Opportunity, "id">) => void,
  statusColumnsOnly?: boolean
) {
  for (const [columnId, ids] of Object.entries(next)) {
    for (const id of ids) {
      const opp = opportunityById.get(id)
      if (!opp) continue
      const current = statusColumnsOnly ? opp.status : getEffectiveColumnId(opp)
      if (current === columnId) continue

      if (isOpportunityStatusColumnId(columnId, opportunityStatuses)) {
        updateOpportunity(id, {
          company_id: opp.company_id,
          role_id: opp.role_id,
          description: opp.description,
          url: opp.url,
          status: columnId,
          interest_level: opp.interest_level,
          ...(statusColumnsOnly
            ? {}
            : { board_column_id: columnId }),
          hourly_rate: opp.hourly_rate,
          annual_salary: opp.annual_salary,
        })
      } else {
        updateOpportunity(id, {
          company_id: opp.company_id,
          role_id: opp.role_id,
          description: opp.description,
          url: opp.url,
          status: opp.status,
          interest_level: opp.interest_level,
          board_column_id: columnId,
          hourly_rate: opp.hourly_rate,
          annual_salary: opp.annual_salary,
        })
      }
    }
  }
}

type SortableBoardColumnProps = {
  columnId: string
  title: string
  ids: string[]
  totalCount: number
  hasMore: boolean
  onLoadMore: () => void
  opportunityById: Map<string, Opportunity>
  customColumns: readonly KanbanCustomColumn[]
  opportunityStatuses: readonly OpportunityStatusDefinition[]
  onDelete: (id: string) => void
  onOpportunityDoubleClick?: (id: string) => void
  companies?: readonly Company[]
  roles?: readonly Role[]
  badgeColumnUsesStatusOnly?: boolean
  /** Ordem das colunas vem da API (`position`); desliga reordenação por arraste. */
  columnDragDisabled?: boolean
}

function SortableBoardColumn({
  columnDragDisabled,
  ...columnProps
}: SortableBoardColumnProps) {
  const { transform, transition, setNodeRef, attributes, listeners, isDragging } =
    useSortable({
      id: columnSortableId(columnProps.columnId),
      disabled: columnDragDisabled ?? false,
    })

  return (
    <div
      ref={setNodeRef}
      className="flex h-full min-h-0 flex-col"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : undefined,
      }}
    >
      <KanbanColumn
        {...columnProps}
        isDraggingColumn={isDragging}
        dragHandleAttributes={attributes}
        dragHandleListeners={listeners}
        showColumnDragHandle={!columnDragDisabled}
      />
    </div>
  )
}

export type OpportunitiesKanbanBoardProps = {
  opportunities: readonly Opportunity[]
  customColumns: readonly KanbanCustomColumn[]
  opportunityStatuses: readonly OpportunityStatusDefinition[]
  columnOrder: readonly string[]
  onColumnOrderChange: (order: string[]) => void
  onAddColumn: (title: string) => void
  updateOpportunity: (id: string, row: Omit<Opportunity, "id">) => void
  onRequestDelete: (id: string) => void
  onOpportunityDoubleClick?: (id: string) => void
  /**
   * Somente colunas de `opportunity_statuses` (API): ignora colunas custom do app-data.
   * Cards são agrupados por `status`, não por `board_column_id`.
   */
  statusColumnsOnly?: boolean
  /** Listas da API (ou pai) para títulos nos cards; sem isso, usa `useAppData()` no card. */
  companies?: readonly Company[]
  roles?: readonly Role[]
  /**
   * Com `statusColumnsOnly`: após criar status pelo input inline, refetch das listas no pai.
   */
  onOpportunityStatusesRefresh?: () => void | Promise<void>
}

/**
 * Board Kanban: colunas reordenáveis + cards reordenáveis + carregamento infinito por coluna.
 */
export function OpportunitiesKanbanBoard({
  opportunities,
  customColumns,
  opportunityStatuses,
  columnOrder,
  onColumnOrderChange,
  onAddColumn,
  updateOpportunity,
  onRequestDelete,
  onOpportunityDoubleClick,
  statusColumnsOnly = false,
  companies,
  roles,
  onOpportunityStatusesRefresh,
}: OpportunitiesKanbanBoardProps) {
  const columnsForTitles = statusColumnsOnly ? [] : customColumns

  const canonicalColumnIds = React.useMemo(
    () =>
      statusColumnsOnly
        ? getOrderedKanbanColumnIds(opportunityStatuses, [])
        : getOrderedKanbanColumnIds(opportunityStatuses, customColumns),
    [statusColumnsOnly, opportunityStatuses, customColumns]
  )

  const itemsByColumnOpts = React.useMemo(
    () =>
      statusColumnsOnly ? { assignColumnByStatusOnly: true as const } : undefined,
    [statusColumnsOnly]
  )

  const [orderedColumnIds, setOrderedColumnIds] = React.useState<string[]>(() =>
    applyPersistedColumnOrder(
      canonicalColumnIds,
      statusColumnsOnly ? [] : columnOrder
    )
  )

  const opportunityById = React.useMemo(() => {
    const m = new Map<string, Opportunity>()
    for (const o of opportunities) m.set(o.id, o)
    return m
  }, [opportunities])

  const opportunityByIdRef = React.useRef(opportunityById)
  opportunityByIdRef.current = opportunityById

  const [columnItems, setColumnItems] = React.useState<Record<string, string[]>>(() =>
    itemsByColumnFromOpportunities(
      opportunities,
      orderedColumnIds,
      opportunityStatuses,
      itemsByColumnOpts
    )
  )
  const [visibleCountByColumn, setVisibleCountByColumn] = React.useState<
    Record<string, number>
  >(() => {
    const initial = itemsByColumnFromOpportunities(
      opportunities,
      orderedColumnIds,
      opportunityStatuses,
      itemsByColumnOpts
    )
    const next: Record<string, number> = {}
    for (const columnId of orderedColumnIds) {
      next[columnId] = Math.min(KANBAN_COLUMN_PAGE_SIZE, initial[columnId]?.length ?? 0)
    }
    return next
  })

  const [newColumnName, setNewColumnName] = React.useState("")
  const [newOpportunityStatusLabel, setNewOpportunityStatusLabel] =
    React.useState("")
  const [statusCreateSubmitting, setStatusCreateSubmitting] = React.useState(false)
  const [statusCreateError, setStatusCreateError] = React.useState<string | null>(
    null
  )
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const lastOverId = React.useRef<string | null>(null)
  const recentlyMovedToNewContainer = React.useRef(false)
  const snapshotRef = React.useRef(columnItems)

  React.useEffect(() => {
    if (activeId !== null) return
    const persistedOrder = statusColumnsOnly ? [] : columnOrder
    const nextOrder = applyPersistedColumnOrder(canonicalColumnIds, persistedOrder)
    setOrderedColumnIds(nextOrder)
    const nextItems = itemsByColumnFromOpportunities(
      opportunities,
      nextOrder,
      opportunityStatuses,
      itemsByColumnOpts
    )
    setColumnItems(nextItems)
    setVisibleCountByColumn((prev) => {
      const next: Record<string, number> = {}
      for (const columnId of nextOrder) {
        const total = nextItems[columnId]?.length ?? 0
        const current = prev[columnId] ?? KANBAN_COLUMN_PAGE_SIZE
        next[columnId] = Math.min(Math.max(current, KANBAN_COLUMN_PAGE_SIZE), total)
      }
      return next
    })
  }, [
    opportunities,
    activeId,
    canonicalColumnIds,
    columnOrder,
    statusColumnsOnly,
    opportunityStatuses,
    itemsByColumnOpts,
  ])

  React.useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false
    })
  }, [columnItems])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const isActiveColumnDrag = activeId != null && parseColumnSortableId(activeId) != null

  const collisionDetectionStrategy = React.useCallback<CollisionDetection>(
    (args) => {
      if (parseColumnSortableId(String(args.active.id)) != null) {
        return closestCorners(args)
      }

      const pointerIntersections = pointerWithin(args)
      const intersections =
        pointerIntersections.length > 0
          ? pointerIntersections
          : rectIntersection(args)
      let overId = getFirstCollision(intersections, "id") as string | null

      if (overId != null) {
        const overCol = parseColumnDroppableId(overId)
        if (overCol != null && Object.prototype.hasOwnProperty.call(columnItems, overCol)) {
          const colIds = columnItems[overCol] ?? []
          if (colIds.length > 0) {
            const closestInCol = closestCorners({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (c) => c.id !== overId && colIds.includes(String(c.id))
              ),
            })
            if (closestInCol[0]) {
              overId = String(closestInCol[0].id)
            }
          }
        }
        lastOverId.current = overId
        return [{ id: overId }]
      }

      if (recentlyMovedToNewContainer.current && activeId) {
        lastOverId.current = activeId
      }

      return lastOverId.current ? [{ id: lastOverId.current }] : []
    },
    [activeId, columnItems]
  )

  function handleDragStart(event: DragStartEvent) {
    snapshotRef.current = columnItems
    setActiveId(String(event.active.id))
    lastOverId.current = null
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return
    if (parseColumnSortableId(String(active.id)) != null) return

    const overId = String(over.id)
    if (active.id === over.id) return

    setColumnItems((items) => {
      const activeContainer = findColumnForItemId(String(active.id), items)
      const overContainer = resolveOverColumn(overId, items)

      if (!activeContainer || !overContainer) return items
      if (activeContainer === overContainer) return items

      const activeItems = [...(items[activeContainer] ?? [])]
      const overItems = [...(items[overContainer] ?? [])]
      const activeIndex = activeItems.indexOf(String(active.id))
      if (activeIndex < 0) return items

      const overIndexInList = overItems.indexOf(overId)
      let newIndex = overItems.length

      if (parseColumnDroppableId(overId) !== overContainer && overIndexInList >= 0) {
        const isBelowOverItem =
          active.rect.current.translated &&
          active.rect.current.translated.top > over.rect.top + over.rect.height
        const modifier = isBelowOverItem ? 1 : 0
        newIndex = overIndexInList + modifier
      }

      recentlyMovedToNewContainer.current = true

      const movingId = String(active.id)
      return {
        ...items,
        [activeContainer]: activeItems.filter((i) => i !== movingId),
        [overContainer]: [
          ...overItems.slice(0, newIndex),
          movingId,
          ...overItems.slice(newIndex),
        ],
      }
    })
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    lastOverId.current = null

    if (!over) {
      setColumnItems(snapshotRef.current)
      return
    }

    const activeColumnSortableId = parseColumnSortableId(String(active.id))
    if (activeColumnSortableId) {
      if (statusColumnsOnly) return
      const overColumnSortableId = parseColumnSortableId(String(over.id))
      if (!overColumnSortableId || activeColumnSortableId === overColumnSortableId) return

      setOrderedColumnIds((prev) => {
        const oldIndex = prev.indexOf(activeColumnSortableId)
        const newIndex = prev.indexOf(overColumnSortableId)
        if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) return prev
        const next = arrayMove(prev, oldIndex, newIndex)
        onColumnOrderChange(next)
        return next
      })
      return
    }

    setColumnItems((items) => {
      const activeContainer = findColumnForItemId(String(active.id), items)
      const overContainer = resolveOverColumn(String(over.id), items)

      if (
        activeContainer &&
        overContainer &&
        activeContainer === overContainer &&
        active.id !== over.id
      ) {
        const list = [...(items[activeContainer] ?? [])]
        const oldIndex = list.indexOf(String(active.id))
        const newIndex = list.indexOf(String(over.id))
        if (oldIndex < 0 || newIndex < 0 || oldIndex === newIndex) {
          persistColumnIfNeeded(
            items,
            opportunityByIdRef.current,
            opportunityStatuses,
            updateOpportunity,
            statusColumnsOnly
          )
          return items
        }
        const next = {
          ...items,
          [activeContainer]: arrayMove(list, oldIndex, newIndex),
        }
        persistColumnIfNeeded(
          next,
          opportunityByIdRef.current,
          opportunityStatuses,
          updateOpportunity,
          statusColumnsOnly
        )
        return next
      }

      persistColumnIfNeeded(
        items,
        opportunityByIdRef.current,
        opportunityStatuses,
        updateOpportunity,
        statusColumnsOnly
      )
      return items
    })
  }

  function handleDragCancel(_event: DragCancelEvent) {
    setActiveId(null)
    lastOverId.current = null
    setColumnItems(snapshotRef.current)
  }

  function handleAddColumn() {
    const trimmed = newColumnName.trim()
    const nextNumber = customColumns.length + 1
    onAddColumn(trimmed || `New column ${nextNumber}`)
    setNewColumnName("")
  }

  async function handleAddOpportunityStatusFromInput() {
    const trimmed = newOpportunityStatusLabel.trim()
    if (!trimmed || !onOpportunityStatusesRefresh) return
    setStatusCreateError(null)
    setStatusCreateSubmitting(true)
    try {
      await createOpportunityStatus({
        label: trimmed,
        description: null,
        variant: "secondary",
      })
      setNewOpportunityStatusLabel("")
      await onOpportunityStatusesRefresh()
    } catch (e) {
      setStatusCreateError(apiFormErrorFromUnknown(e, "Could not create status."))
    } finally {
      setStatusCreateSubmitting(false)
    }
  }

  function handleLoadMoreColumn(columnId: string) {
    setVisibleCountByColumn((prev) => {
      const current = prev[columnId] ?? 0
      const total = columnItems[columnId]?.length ?? 0
      return {
        ...prev,
        [columnId]: Math.min(current + KANBAN_COLUMN_PAGE_SIZE, total),
      }
    })
  }

  const activeOpp =
    !isActiveColumnDrag && activeId ? opportunityById.get(activeId) : null

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetectionStrategy}
        measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
        autoScroll={{ acceleration: 12, interval: 5 }}
        modifiers={[snapCenterToCursor, restrictToWindowEdges]}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext
          items={orderedColumnIds.map((id) => columnSortableId(id))}
          strategy={horizontalListSortingStrategy}
        >
          <div className="flex h-full min-h-0 flex-1 items-stretch gap-3 overflow-x-auto overflow-y-hidden pb-1">
            {orderedColumnIds.map((columnId) => {
              const idsForColumn = columnItems[columnId] ?? []
              const visibleCount = visibleCountByColumn[columnId] ?? 0
              const visibleIds = idsForColumn.slice(0, visibleCount)
              const hasMore = visibleCount < idsForColumn.length
              return (
                <SortableBoardColumn
                  key={columnId}
                  columnId={columnId}
                  title={getColumnTitle(
                    columnId,
                    opportunityStatuses,
                    columnsForTitles
                  )}
                  ids={visibleIds}
                  totalCount={idsForColumn.length}
                  hasMore={hasMore}
                  onLoadMore={() => handleLoadMoreColumn(columnId)}
                  opportunityById={opportunityById}
                  customColumns={columnsForTitles}
                  opportunityStatuses={opportunityStatuses}
                  onDelete={onRequestDelete}
                  onOpportunityDoubleClick={onOpportunityDoubleClick}
                  companies={companies}
                  roles={roles}
                  badgeColumnUsesStatusOnly={statusColumnsOnly}
                  columnDragDisabled={statusColumnsOnly}
                />
              )
            })}
            {statusColumnsOnly ? (
              onOpportunityStatusesRefresh ? (
                <div className="flex h-full min-h-0 w-[min(100%,280px)] shrink-0 flex-col sm:w-72">
                  <div className="mb-2 flex shrink-0 flex-col gap-1 px-0.5">
                    <Input
                      value={newOpportunityStatusLabel}
                      onChange={(event) => {
                        setNewOpportunityStatusLabel(event.target.value)
                        if (statusCreateError) setStatusCreateError(null)
                      }}
                      placeholder="New column name..."
                      disabled={statusCreateSubmitting}
                      className="h-8 focus-visible:ring-1 focus-visible:ring-inset"
                      onKeyDown={(event) => {
                        if (event.key !== "Enter") return
                        event.preventDefault()
                        void handleAddOpportunityStatusFromInput()
                      }}
                    />
                    {statusCreateError ? (
                      <p className="text-destructive px-0.5 text-xs" role="alert">
                        {statusCreateError}
                      </p>
                    ) : null}
                  </div>
                  <div
                    className="border-border/80 bg-muted/30 flex min-h-0 flex-1 flex-col rounded-lg border border-dashed p-2"
                    aria-hidden
                  />
                </div>
              ) : null
            ) : (
              <div className="flex h-full min-h-0 w-[min(100%,280px)] shrink-0 flex-col sm:w-72">
                <div className="mb-2 flex shrink-0 items-center gap-2 px-0.5">
                  <Input
                    value={newColumnName}
                    onChange={(event) => setNewColumnName(event.target.value)}
                    placeholder="New column name..."
                    className="h-8 focus-visible:ring-1 focus-visible:ring-inset"
                    onKeyDown={(event) => {
                      if (event.key !== "Enter") return
                      event.preventDefault()
                      handleAddColumn()
                    }}
                  />
                </div>
                <div
                  className="border-border/80 bg-muted/30 flex min-h-0 flex-1 flex-col rounded-lg border border-dashed p-2"
                  aria-hidden
                />
              </div>
            )}
          </div>
        </SortableContext>

        <DragOverlay
          dropAnimation={{
            duration: 180,
            easing: "cubic-bezier(0.25, 1, 0.5, 1)",
          }}
        >
          {activeOpp ? (
            <div className="w-[260px] cursor-grabbing">
              <KanbanJobCardContent
                opp={activeOpp}
                onDelete={onRequestDelete}
                customColumns={columnsForTitles}
                opportunityStatuses={opportunityStatuses}
                companies={companies}
                roles={roles}
                badgeColumnUsesStatusOnly={statusColumnsOnly}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
