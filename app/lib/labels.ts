export type OpportunityStatus =
  | "INTERESTED IN"
  | "SENT RESUME"
  | "SCHEDULED INTERVIEW"
  | "WAITING RESPONSE"

export const OPPORTUNITY_STATUS_OPTIONS: OpportunityStatus[] = [
  "INTERESTED IN",
  "SENT RESUME",
  "SCHEDULED INTERVIEW",
  "WAITING RESPONSE",
]

export const statusBadge: Record<
  OpportunityStatus,
  { label: string; variant: "secondary" | "outline" | "default" | "destructive" }
> = {
  "INTERESTED IN":       { label: "Interested In",       variant: "secondary" },
  "SENT RESUME":         { label: "Sent Resume",         variant: "outline" },
  "SCHEDULED INTERVIEW": { label: "Scheduled Interview", variant: "default" },
  "WAITING RESPONSE":    { label: "Waiting Response",    variant: "destructive" },
}

export type InterestLevel = "Low" | "Medium" | "High"

export const INTEREST_LEVEL_OPTIONS: InterestLevel[] = ["Low", "Medium", "High"]

export const interestBadge: Record<
  InterestLevel,
  { variant: "outline" | "secondary" | "default" }
> = {
  Low:    { variant: "outline" },
  Medium: { variant: "secondary" },
  High:   { variant: "default" },
}
