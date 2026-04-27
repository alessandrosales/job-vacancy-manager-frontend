import type { Company, Opportunity, Role } from "~/components/providers/app-data-provider"

const hourlyCompFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

const annualCompFmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
})

/** Display hourly gross pay, or em dash if unset. */
export function formatOpportunityHourlyRate(value: number | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—"
  return `${hourlyCompFmt.format(value)}/hr`
}

/** Display annual total compensation, or em dash if unset. */
export function formatOpportunityAnnualSalary(value: number | undefined): string {
  if (value == null || !Number.isFinite(value)) return "—"
  return `${annualCompFmt.format(value)}/yr`
}

/** One line for tables/cards: both values or empty parts omitted. */
export function formatOpportunityCompensationSummary(opp: Opportunity): string {
  const parts: string[] = []
  if (opp.hourly_rate != null && Number.isFinite(opp.hourly_rate)) {
    parts.push(formatOpportunityHourlyRate(opp.hourly_rate))
  }
  if (opp.annual_salary != null && Number.isFinite(opp.annual_salary)) {
    parts.push(formatOpportunityAnnualSalary(opp.annual_salary))
  }
  return parts.join(" · ")
}

export function opportunityCompanyName(
  opp: Opportunity,
  companies: readonly Company[]
): string {
  return companies.find((c) => c.id === opp.company_id)?.name ?? "—"
}

export function opportunityRoleName(
  opp: Opportunity,
  roles: readonly Role[]
): string {
  return roles.find((r) => r.id === opp.role_id)?.name ?? "—"
}

export function opportunitySearchBlob(
  opp: Opportunity,
  companies: readonly Company[],
  roles: readonly Role[],
  extra: string
): string {
  const comp = [opp.hourly_rate, opp.annual_salary]
    .filter((n) => n != null && Number.isFinite(n))
    .join(" ")
  return `${opportunityCompanyName(opp, companies)} ${opportunityRoleName(opp, roles)} ${comp} ${extra}`
}
