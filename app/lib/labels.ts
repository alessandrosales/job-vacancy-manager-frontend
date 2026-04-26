/**
 * `OpportunityStatus` é o id persistido (string estável), definido em
 * `OpportunityStatusDefinition` no estado da aplicação — não um enum fixo.
 */
export type OpportunityStatus = string

export type StatusBadgeVariant =
  | "secondary"
  | "outline"
  | "default"
  | "destructive"

export type OpportunityStatusDefinition = {
  id: OpportunityStatus
  label: string
  description?: string
  variant: StatusBadgeVariant
}

/** Status iniciais (ids legados) — alimentam o Kanban e a migração de dados. */
export const DEFAULT_OPPORTUNITY_STATUS_DEFINITIONS: readonly OpportunityStatusDefinition[] =
  [
    {
      id: "INTERESTED IN",
      label: "Interested In",
      variant: "secondary",
    },
    {
      id: "SENT RESUME",
      label: "Sent Resume",
      variant: "outline",
    },
    {
      id: "SCHEDULED INTERVIEW",
      label: "Scheduled Interview",
      variant: "default",
    },
    {
      id: "WAITING RESPONSE",
      label: "Waiting Response",
      variant: "destructive",
    },
  ]

export type InterestLevel = 0 | 1 | 2 | 3 | 4 | 5

export const INTEREST_LEVEL_OPTIONS: InterestLevel[] = [0, 1, 2, 3, 4, 5]
