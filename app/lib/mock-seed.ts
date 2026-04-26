import type {
  Company,
  Opportunity,
  Role,
  Skill,
} from "~/components/providers/app-data-provider"
import {
  DEFAULT_OPPORTUNITY_STATUS_DEFINITIONS,
  type InterestLevel,
} from "~/lib/labels"

/** Totals used for default seed — tune for stress-testing the UI. */
export const MOCK_SEED_TOTALS = {
  opportunities: 360,
  companies: 300,
  roles: 240,
  skills: 420,
} as const

const COMPANY_PREFIXES = [
  "Acme",
  "Globex",
  "Initech",
  "Umbrella",
  "Hooli",
  "Pied Piper",
  "Stark",
  "Wayne",
  "Cyberdyne",
  "Massive",
  "Soylent",
  "Wonka",
] as const

const ROLE_TITLES = [
  "Frontend Developer",
  "Full Stack Engineer",
  "Platform Engineer",
  "Staff Engineer",
  "UX Designer",
  "Product Manager",
  "Data Engineer",
  "Security Engineer",
  "Mobile Developer",
  "DevRel",
] as const

const SKILL_NAMES = [
  "React",
  "TypeScript",
  "Node.js",
  "PostgreSQL",
  "Docker",
  "Kubernetes",
  "GraphQL",
  "Redis",
  "AWS",
  "Terraform",
  "Go",
  "Rust",
  "Python",
  "Tailwind CSS",
  "Next.js",
  "Remix",
  "Playwright",
  "Vitest",
  "Kafka",
  "Elasticsearch",
] as const

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length]!
}

export function generateMockOpportunities(
  count: number,
  statusIds: readonly string[],
  companies: Company[],
  roles: Role[]
): Opportunity[] {
  const rows: Opportunity[] = []
  if (companies.length === 0 || roles.length === 0) {
    return rows
  }
  for (let i = 0; i < count; i++) {
    const status = pick(statusIds, i)
    rows.push({
      id: `seed-opp-${i}`,
      company_id: companies[i % companies.length]!.id,
      role_id: roles[(i + 3) % roles.length]!.id,
      description: `Position #${i + 1}: build product features, collaborate with cross-functional teams, and ship quality software. Stack varies by team.`,
      url: `https://example.com/jobs/${1000 + i}`,
      status,
      interest_level: i % 6,
    })
  }
  return rows
}

export function generateMockCompanies(count: number): Company[] {
  const rows: Company[] = []
  for (let i = 0; i < count; i++) {
    const base = pick(COMPANY_PREFIXES, i * 2)
    rows.push({
      id: `seed-co-${i}`,
      name: i === 0 ? `${base} Industries` : `${base} ${i + 1}`,
      url: `https://${base.toLowerCase().replace(/\s+/g, "")}.example.com`,
      description: `Company #${i + 1}: technology and services organisation. Interest level reflects your own rating for tracking.`,
      interest_level: pick([0, 1, 2, 3, 4, 5] as const, i) as InterestLevel,
    })
  }
  return rows
}

export function generateMockRoles(count: number): Role[] {
  const rows: Role[] = []
  for (let i = 0; i < count; i++) {
    const title = pick(ROLE_TITLES, i)
    rows.push({
      id: `seed-ro-${i}`,
      name: `${title}${i >= ROLE_TITLES.length ? ` — band ${Math.floor(i / ROLE_TITLES.length)}` : ""}`,
      description: `Role #${i + 1}: responsibilities include delivery, mentoring, and alignment with product goals.`,
      interest_level: pick([0, 1, 2, 3, 4, 5] as const, i + 1) as InterestLevel,
    })
  }
  return rows
}

export function generateMockSkills(count: number): Skill[] {
  const rows: Skill[] = []
  for (let i = 0; i < count; i++) {
    const name = pick(SKILL_NAMES, i)
    rows.push({
      id: `seed-sk-${i}`,
      name: `${name}${i >= SKILL_NAMES.length ? ` (${Math.floor(i / SKILL_NAMES.length)})` : ""}`,
      description: `Skill #${i + 1}: ${name} — relevant for interviews, CV keywords, and project experience.`,
    })
  }
  return rows
}

export function generateLargeMockDataset() {
  const opportunity_statuses = DEFAULT_OPPORTUNITY_STATUS_DEFINITIONS.map((s) => ({
    ...s,
  }))
  const statusIds = opportunity_statuses.map((s) => s.id)
  const companies = generateMockCompanies(MOCK_SEED_TOTALS.companies)
  const roles = generateMockRoles(MOCK_SEED_TOTALS.roles)
  return {
    opportunities: generateMockOpportunities(
      MOCK_SEED_TOTALS.opportunities,
      statusIds,
      companies,
      roles
    ),
    companies,
    roles,
    skills: generateMockSkills(MOCK_SEED_TOTALS.skills),
    opportunity_statuses,
    kanban_custom_columns: [] as { id: string; title: string }[],
    kanban_column_order: [] as string[],
  }
}
