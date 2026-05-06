import type {
  Certification,
  Company,
  Education,
  Opportunity,
  ReferenceLink,
  ResumeDocument,
  Role,
  Skill,
  WorkExperience,
} from "~/components/providers/app-data-provider"
import {
  DEFAULT_OPPORTUNITY_STATUS_DEFINITIONS,
  type InterestLevel,
} from "~/lib/labels"
import { RESUME_PREFERRED_LANGUAGE_CODES } from "~/lib/resume-preferred-language"

/** Totals used for default seed — tune for stress-testing the UI. */
export const MOCK_SEED_TOTALS = {
  opportunities: 360,
  companies: 300,
  roles: 240,
  skills: 420,
  work_experiences: 48,
  certifications: 36,
  education: 32,
  resumes: 12,
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
    const hourly = 40 + (i % 12) * 3 + (i % 2) * 0.5
    const annual = Math.round(hourly * 1800 + (i % 7) * 5000)
    rows.push({
      id: `seed-opp-${i}`,
      company_id: companies[i % companies.length]!.id,
      role_id: roles[(i + 3) % roles.length]!.id,
      description: `Position #${i + 1}: build product features, collaborate with cross-functional teams, and ship quality software. Stack varies by team.`,
      url: `https://example.com/jobs/${1000 + i}`,
      status,
      interest_level: i % 6,
      hourly_rate: Math.round(hourly * 100) / 100,
      annual_salary: annual,
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

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

export function generateMockWorkExperiences(
  count: number,
  skills: Skill[],
  companies: Company[]
): WorkExperience[] {
  const rows: WorkExperience[] = []
  if (skills.length === 0 || companies.length === 0) return rows
  for (let i = 0; i < count; i++) {
    const co = companies[i % companies.length]!
    const y = 2015 + (i % 8)
    const m = (i % 11) + 1
    const y2 = y + 1 + (i % 2)
    const m2 = ((m + 5) % 12) + 1
    const nSkills = 1 + (i % 4)
    const skill_ids: string[] = []
    for (let k = 0; k < nSkills; k++) {
      const sid = skills[(i * 3 + k * 11) % skills.length]!.id
      if (!skill_ids.includes(sid)) skill_ids.push(sid)
    }
    rows.push({
      id: `seed-we-${i}`,
      title: `${pick(ROLE_TITLES, i)}${i >= ROLE_TITLES.length ? ` — ${i}` : ""}`,
      company_name: co.name,
      is_remote: i % 3 === 0,
      date_from: `${y}-${pad2(m)}-01`,
      date_to: `${y2}-${pad2(m2)}-01`,
      skill_ids,
    })
  }
  return rows
}

const CERT_NAMES = [
  "AWS Certified Developer",
  "Kubernetes Administrator",
  "Professional Scrum Master",
  "Google Cloud Professional",
  "Terraform Associate",
] as const

export function generateMockCertifications(count: number): Certification[] {
  const rows: Certification[] = []
  for (let i = 0; i < count; i++) {
    const y = 2020 + (i % 5)
    rows.push({
      id: `seed-cert-${i}`,
      name: `${pick(CERT_NAMES, i)} #${i + 1}`,
      date_from: `${y}-03-15`,
      date_to: `${y + 2}-03-15`,
    })
  }
  return rows
}

const DEGREES = ["B.Sc.", "M.Sc.", "B.A.", "MBA", "Tech."] as const
const FIELDS = ["Computer Science", "Information Systems", "Design", "Business"] as const
const INSTITUTIONS = [
  "State University",
  "Institute of Technology",
  "Polytechnic School",
  "National College",
] as const

export function generateMockEducation(count: number): Education[] {
  const rows: Education[] = []
  for (let i = 0; i < count; i++) {
    const y = 2012 + (i % 6)
    rows.push({
      id: `seed-edu-${i}`,
      institution_name: `${pick(INSTITUTIONS, i)} ${i + 1}`,
      degree: pick(DEGREES, i),
      field_of_study: pick(FIELDS, i + 1),
      date_from: `${y}-08-01`,
      date_to: `${y + 4}-07-30`,
    })
  }
  return rows
}

const RESUME_LABELS = [
  "Full stack — default",
  "Frontend specialist",
  "Backend / platform",
  "Leadership track",
  "Contractor short CV",
  "Academic + industry",
] as const

function pickDistinctFrom<T>(source: readonly T[], count: number, seed: number): T[] {
  if (source.length === 0 || count <= 0) return []
  const out: T[] = []
  let k = 0
  while (out.length < Math.min(count, source.length) && k < source.length * 3) {
    const item = source[(seed + k * 5) % source.length]!
    k++
    if (!out.includes(item)) out.push(item)
  }
  return out
}

export function generateMockResumes(
  count: number,
  ctx: {
    work_experiences: WorkExperience[]
    certifications: Certification[]
    education: Education[]
    skills: Skill[]
    roles: Role[]
  }
): ResumeDocument[] {
  const weIds = ctx.work_experiences.map((w) => w.id)
  const certIds = ctx.certifications.map((c) => c.id)
  const eduIds = ctx.education.map((e) => e.id)
  const skIds = ctx.skills.map((s) => s.id)
  const roleIds = ctx.roles.map((r) => r.id)
  const rows: ResumeDocument[] = []
  for (let i = 0; i < count; i++) {
    const y = 2024 - (i % 3)
    const m = ((i + 2) % 12) + 1
    const d = ((i * 3) % 27) + 1
    const pad = (n: number) => String(n).padStart(2, "0")
    rows.push({
      id: `seed-res-${i}`,
      title: `${pick(RESUME_LABELS, i)}${i >= RESUME_LABELS.length ? ` #${i + 1}` : ""}`,
      description: `Snapshot #${i + 1}: headline, highlights, and keywords tailored for applications. Edit from the card actions or detail form.`,
      preferred_language: RESUME_PREFERRED_LANGUAGE_CODES[
        i % RESUME_PREFERRED_LANGUAGE_CODES.length
      ]!,
      compiled_markdown: null,
      updated_at: `${y}-${pad(m)}-${pad(d)}`,
      role_id: roleIds[i % roleIds.length] ?? "",
      work_experience_ids: pickDistinctFrom(weIds, 2 + (i % 3), i),
      certification_ids: pickDistinctFrom(certIds, 1 + (i % 2), i + 3),
      education_ids: pickDistinctFrom(eduIds, 1 + (i % 2), i + 5),
      skill_ids: pickDistinctFrom(skIds, 3 + (i % 4), i + 7),
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
  const skills = generateMockSkills(MOCK_SEED_TOTALS.skills)
  const work_experiences = generateMockWorkExperiences(
    MOCK_SEED_TOTALS.work_experiences,
    skills,
    companies
  )
  const certifications = generateMockCertifications(MOCK_SEED_TOTALS.certifications)
  const education = generateMockEducation(MOCK_SEED_TOTALS.education)
  const resumes = generateMockResumes(MOCK_SEED_TOTALS.resumes, {
    work_experiences,
    certifications,
    education,
    skills,
    roles,
  })
  return {
    opportunities: generateMockOpportunities(
      MOCK_SEED_TOTALS.opportunities,
      statusIds,
      companies,
      roles
    ),
    companies,
    roles,
    skills,
    reference_links: [] as ReferenceLink[],
    work_experiences,
    certifications,
    education,
    resumes,
    opportunity_statuses,
    kanban_custom_columns: [] as { id: string; title: string }[],
    kanban_column_order: [] as string[],
  }
}
