"use client"

import * as React from "react"
import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Loader2Icon } from "lucide-react"

import { KanbanJobCard } from "~/components/opportunities/kanban/kanban-job-card"
import type { KanbanCustomColumn, Opportunity } from "~/components/providers/app-data-provider"
import { Badge } from "~/components/ui/badge"
import { columnDroppableId } from "~/lib/kanban-columns"
import { cn } from "~/lib/utils"

export type KanbanColumnProps = {
  columnId: string
  title: string
  ids: string[]
  totalCount: number
  hasMore: boolean
  onLoadMore: () => void
  opportunityById: Map<string, Opportunity>
  customColumns: readonly KanbanCustomColumn[]
  onDelete: (id: string) => void
}

/**
 * Uma coluna do Kanban: cabeçalho, contagem, área droppable e lista sortable.
 */
export function KanbanColumn({
  columnId,
  title,
  ids,
  totalCount,
  hasMore,
  onLoadMore,
  opportunityById,
  customColumns,
  onDelete,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: columnDroppableId(columnId),
    data: { type: "column" as const, columnId },
  })
  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  const sentinelRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const root = scrollRef.current
    const target = sentinelRef.current
    if (!root || !target || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMore()
        }
      },
      {
        root,
        rootMargin: "120px",
        threshold: 0,
      }
    )

    observer.observe(target)
    return () => observer.disconnect()
  }, [hasMore, onLoadMore, ids.length])

  return (
    <div className="flex min-h-0 w-[min(100%,280px)] shrink-0 flex-col self-stretch sm:w-72">
      <div className="mb-2 flex shrink-0 items-center justify-between gap-2 px-0.5">
        <span className="truncate text-sm font-medium text-foreground" title={title}>
          {title}
        </span>
        <Badge variant="outline" className="shrink-0 tabular-nums">
          {ids.length}
        </Badge>
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-0 flex-1 flex-col rounded-lg border border-dashed bg-muted/30 p-2 transition-colors",
          isOver ? "border-primary/60 bg-muted/50" : "border-border/80"
        )}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div
            ref={scrollRef}
            className="scrollbar-subtle flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto"
          >
            {ids.map((id) => {
              const opp = opportunityById.get(id)
              if (!opp) return null
              return (
                <KanbanJobCard
                  key={id}
                  opp={opp}
                  onDelete={onDelete}
                  customColumns={customColumns}
                />
              )
            })}
            <div ref={sentinelRef} className="shrink-0 py-1 text-center">
              {hasMore ? (
                <span className="text-muted-foreground inline-flex items-center gap-1.5 text-[11px]">
                  <Loader2Icon className="size-3 animate-spin" />
                  Loading more ({ids.length}/{totalCount})
                </span>
              ) : null}
            </div>
          </div>
        </SortableContext>
      </div>
    </div>
  )
}
