"use client"

import * as React from "react"
import { Link } from "react-router"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { ExternalLinkIcon, PencilIcon, StarIcon, Trash2Icon } from "lucide-react"

import type { KanbanCustomColumn, Opportunity } from "~/components/providers/app-data-provider"
import type { OpportunityStatusDefinition } from "~/lib/labels"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent } from "~/components/ui/card"
import { getColumnBadgeProps, getEffectiveColumnId } from "~/lib/kanban-columns"
import { cn } from "~/lib/utils"

export type KanbanJobCardContentProps = {
  opp: Opportunity
  onDelete: (id: string) => void
  customColumns: readonly KanbanCustomColumn[]
  opportunityStatuses: readonly OpportunityStatusDefinition[]
  className?: string
}

/**
 * Conteúdo do card (empresa, papel, ações) — reutilizado no overlay de arraste.
 */
export function KanbanJobCardContent({
  opp,
  onDelete,
  customColumns,
  opportunityStatuses,
  className,
}: KanbanJobCardContentProps) {
  const columnId = getEffectiveColumnId(opp)
  const badge = getColumnBadgeProps(
    columnId,
    opportunityStatuses,
    customColumns
  )

  return (
    <Card
      className={cn(
        "gap-0 py-0 shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      <CardContent className="flex flex-col gap-1.5 px-3 py-2">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 flex-1 truncate font-medium leading-snug text-foreground">
              {opp.company}
            </p>
            {opp.url ? (
              <Button variant="ghost" size="icon" className="size-7 shrink-0" asChild>
                <a
                  href={opp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open opportunity link"
                  onPointerDown={(e) => e.stopPropagation()}
                  onDoubleClick={(e) => e.stopPropagation()}
                >
                  <ExternalLinkIcon />
                </a>
              </Button>
            ) : null}
          </div>
          <p className="text-muted-foreground text-sm leading-snug">{opp.role}</p>
        </div>
        {opp.description ? (
          <p className="text-muted-foreground line-clamp-2 text-xs leading-snug">
            {opp.description}
          </p>
        ) : null}
        <div className="inline-flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <StarIcon
              key={i}
              className={cn(
                "size-3",
                i < opp.interest_level
                  ? "fill-current text-amber-500"
                  : "text-muted-foreground/35"
              )}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-1.5">
          <Badge variant={badge.variant} className="text-xs">
            {badge.label}
          </Badge>
          <div
            className="flex items-center gap-0.5"
            onDoubleClick={(e) => e.stopPropagation()}
          >
            <Button variant="ghost" size="icon" className="size-7" asChild>
              <Link
                to={`/opportunities/opportunity/${encodeURIComponent(opp.id)}`}
                aria-label="Edit opportunity"
                onPointerDown={(e) => e.stopPropagation()}
                onDoubleClick={(e) => e.stopPropagation()}
              >
                <PencilIcon />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-destructive hover:text-destructive"
              type="button"
              aria-label="Delete opportunity"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                onDelete(opp.id)
              }}
            >
              <Trash2Icon />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

type KanbanJobCardProps = {
  opp: Opportunity
  onDelete: (id: string) => void
  onOpportunityDoubleClick?: (id: string) => void
  customColumns: readonly KanbanCustomColumn[]
  opportunityStatuses: readonly OpportunityStatusDefinition[]
}

/**
 * Card sortable do job (alça de arraste + conteúdo).
 */
export function KanbanJobCard({
  opp,
  onDelete,
  onOpportunityDoubleClick,
  customColumns,
  opportunityStatuses,
}: KanbanJobCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: opp.id,
      data: { type: "card" as const, opp },
    })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="touch-none cursor-grab active:cursor-grabbing"
      onDoubleClick={(e) => {
        e.stopPropagation()
        onOpportunityDoubleClick?.(opp.id)
      }}
      {...listeners}
      {...attributes}
    >
      <KanbanJobCardContent
        opp={opp}
        onDelete={onDelete}
        customColumns={customColumns}
        opportunityStatuses={opportunityStatuses}
      />
    </div>
  )
}
