import type {
  Company,
  Opportunity,
  Role,
  Skill,
} from "~/components/providers/app-data-provider"
import type { InterestLevel, OpportunityStatus } from "~/lib/labels"
import {
  INTEREST_LEVEL_OPTIONS,
  OPPORTUNITY_STATUS_OPTIONS,
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

export function generateMockOpportunities(count: number): Opportunity[] {
  const rows: Opportunity[] = []
  for (let i = 0; i < count; i++) {
    const companyBase = pick(COMPANY_PREFIXES, i)
    const suffix = Math.floor(i / COMPANY_PREFIXES.length)
    const company =
      suffix > 0 ? `${companyBase} Division ${suffix}` : `${companyBase} Corp`
    const status = pick(
      OPPORTUNITY_STATUS_OPTIONS,
      i
    ) as OpportunityStatus
    rows.push({
      id: `seed-opp-${i}`,
      company,
      role: pick(ROLE_TITLES, i + 3),
      description: `Position #${i + 1}: build product features, collaborate with cross-functional teams, and ship quality software. Stack varies by team.`,
      url: `https://example.com/jobs/${1000 + i}`,
      status,
    })
  }
  return rows
}

export function generateMockCompanies(count: number): Company[] {
  const rows: Company[] = []
  for (let i = 0; i < count; i++) {
    const base = pick(COMPANY_PREFIXES, i * 2)
    const interestLevel = pick(INTEREST_LEVEL_OPTIONS, i) as InterestLevel
    rows.push({
      id: `seed-co-${i}`,
      name: i === 0 ? `${base} Industries` : `${base} ${i + 1}`,
      url: `https://${base.toLowerCase().replace(/\s+/g, "")}.example.com`,
      description: `Company #${i + 1}: technology and services organisation. Interest level reflects your own rating for tracking.`,
      interestLevel,
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
      interestLevel: pick(INTEREST_LEVEL_OPTIONS, i + 1) as InterestLevel,
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
  return {
    opportunities: generateMockOpportunities(MOCK_SEED_TOTALS.opportunities),
    companies: generateMockCompanies(MOCK_SEED_TOTALS.companies),
    roles: generateMockRoles(MOCK_SEED_TOTALS.roles),
    skills: generateMockSkills(MOCK_SEED_TOTALS.skills),
  }
}
