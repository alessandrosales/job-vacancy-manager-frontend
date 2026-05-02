import { apiRequestJson } from "~/lib/api/client"
import type { ApiCompany } from "~/lib/api/resources/companies"
import type { ApiOpportunity } from "~/lib/api/resources/opportunities"
import type { ApiOpportunityStatus } from "~/lib/api/resources/opportunity-statuses"
import type { ApiRole } from "~/lib/api/resources/roles"

export interface ApiDashboardPieSlice {
  status_id: string
  label: string
  count: number
}

export interface ApiDashboardWeekdayCount {
  weekday: number
  label: string
  count: number
}

export interface ApiDashboardTrendWeek {
  week_label: string
  counts_by_status_id: Record<string, number>
}

export interface ApiDashboardStatusSeriesRow {
  status_id: string
  label: string
}

/** Linha de tabela / snapshot com nomes para exibição (join no servidor). */
export interface ApiDashboardOpportunityRow extends ApiOpportunity {
  company_name: string
  role_name: string
  status_label: string
  status_variant: string
}

export interface ApiDashboardReferenceLists {
  companies: ApiCompany[]
  roles: ApiRole[]
  opportunity_statuses: ApiOpportunityStatus[]
}

export interface ApiDashboardResponse {
  pie_by_status: ApiDashboardPieSlice[]
  created_by_weekday: ApiDashboardWeekdayCount[]
  trend_by_week: ApiDashboardTrendWeek[]
  status_series: ApiDashboardStatusSeriesRow[]
  recent_opportunities: ApiDashboardOpportunityRow[]
  top_opportunities: ApiDashboardOpportunityRow[]
  reference_lists: ApiDashboardReferenceLists
}

export async function getDashboard(): Promise<ApiDashboardResponse> {
  return apiRequestJson<ApiDashboardResponse>({
    path: "dashboard",
    method: "GET",
  })
}
