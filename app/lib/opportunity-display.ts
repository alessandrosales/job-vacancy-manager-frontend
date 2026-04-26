import type { Company, Opportunity, Role } from "~/components/providers/app-data-provider"

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
  return `${opportunityCompanyName(opp, companies)} ${opportunityRoleName(opp, roles)} ${extra}`
}
