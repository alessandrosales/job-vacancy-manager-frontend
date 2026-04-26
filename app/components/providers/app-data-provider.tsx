"use client"

import * as React from "react"

import { generateLargeMockDataset } from "~/lib/mock-seed"
import {
  DEFAULT_OPPORTUNITY_STATUS_DEFINITIONS,
  type InterestLevel,
  type OpportunityStatus,
  type OpportunityStatusDefinition,
} from "~/lib/labels"

export type {
  OpportunityStatus,
  OpportunityStatusDefinition,
} from "~/lib/labels"

/**
 * v4 — propriedades de entidades usam snake_case para alinhar ao contrato Rails.
 * Lê v3 como fallback (campo camelCase → migra para snake_case em tempo de parse).
 */
const STORAGE_KEY = "job-vacancy-app-data-v4"
const LEGACY_STORAGE_KEYS = [
  "job-vacancy-app-data-v3",
  "job-vacancy-app-data-v2",
]

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

// ---------------------------------------------------------------------------
// Domain interfaces — propriedades multi-palavra em snake_case (contrato Rails)
// ---------------------------------------------------------------------------

export interface Opportunity {
  id: string
  company_id: string
  role_id: string
  description: string
  url: string
  status: OpportunityStatus
  /** 0 = nenhum interesse, 5 = muito interesse. */
  interest_level: number
  /** Coluna do Kanban; ausente = coluna padrão derivada de `status`. */
  board_column_id?: string
}

export interface Company {
  id: string
  name: string
  url: string
  description: string
  interest_level: InterestLevel
}

export interface Role {
  id: string
  name: string
  description: string
  interest_level: InterestLevel
}

export interface Skill {
  id: string
  name: string
  description: string
}

/** Links de referência (ex.: documentação, boards, ferramentas). */
export interface ReferenceLink {
  id: string
  title: string
  url: string
}

export interface WorkExperience {
  id: string
  title: string
  company_name: string
  is_remote: boolean
  date_from: string
  date_to: string
  skill_ids: string[]
}

export interface Certification {
  id: string
  name: string
  date_from: string
  date_to: string
}

export interface Education {
  id: string
  institution_name: string
  degree: string
  field_of_study: string
  date_from: string
  date_to: string
}

/** Saved CV document (distinct from the collapsible “History” menu section). */
export interface ResumeDocument {
  id: string
  title: string
  description: string
  /** YYYY-MM-DD — última atualização. */
  updated_at: string
  /** Exactly one role (FK). */
  role_id: string
  work_experience_ids: string[]
  certification_ids: string[]
  education_ids: string[]
  skill_ids: string[]
}

export interface KanbanCustomColumn {
  id: string
  title: string
}

export interface AppDataState {
  opportunities: Opportunity[]
  companies: Company[]
  roles: Role[]
  skills: Skill[]
  reference_links: ReferenceLink[]
  /** Status das oportunidades (colunas "nativas" do Kanban). Ordem do array = ordem padrão. */
  opportunity_statuses: OpportunityStatusDefinition[]
  /** Colunas extras do Kanban (além dos status). */
  kanban_custom_columns: KanbanCustomColumn[]
  /** Ordem persistida das colunas (status + custom). */
  kanban_column_order: string[]
  work_experiences: WorkExperience[]
  certifications: Certification[]
  /** Academic entries (one row per program or degree). */
  education: Education[]
  /** Currículos salvos (listagem em cards). */
  resumes: ResumeDocument[]
}

// ---------------------------------------------------------------------------
// Parse / migration helpers
// ---------------------------------------------------------------------------

function normalizeInterestLevel(value: unknown): InterestLevel {
  if (typeof value === "number") {
    const clamped = Math.min(5, Math.max(0, Math.round(value)))
    return clamped as InterestLevel
  }
  if (value === "Low") return 1
  if (value === "Medium") return 3
  if (value === "High") return 5
  return 0
}

function normalizeOpportunityStatuses(raw: unknown): OpportunityStatusDefinition[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    return DEFAULT_OPPORTUNITY_STATUS_DEFINITIONS.map((s) => ({ ...s }))
  }
  const next: OpportunityStatusDefinition[] = []
  for (const item of raw) {
    if (
      item &&
      typeof item === "object" &&
      typeof (item as OpportunityStatusDefinition).id === "string" &&
      typeof (item as OpportunityStatusDefinition).label === "string" &&
      typeof (item as OpportunityStatusDefinition).variant === "string"
    ) {
      next.push({
        id: (item as OpportunityStatusDefinition).id,
        label: (item as OpportunityStatusDefinition).label,
        description:
          typeof (item as OpportunityStatusDefinition).description === "string"
            ? (item as OpportunityStatusDefinition).description
            : undefined,
        variant: (item as OpportunityStatusDefinition).variant,
      })
    }
  }
  return next.length > 0
    ? next
    : DEFAULT_OPPORTUNITY_STATUS_DEFINITIONS.map((s) => ({ ...s }))
}

function resolveOpportunityCompanyId(
  o: Record<string, unknown>,
  companies: Company[]
): string {
  const fromId = o.company_id ?? o.companyId
  if (typeof fromId === "string" && companies.some((c) => c.id === fromId)) {
    return fromId
  }
  const legacy = String(o.company ?? "").trim()
  if (legacy) {
    const exact = companies.find((c) => c.name === legacy)
    if (exact) return exact.id
    const lower = legacy.toLowerCase()
    const ci = companies.find((c) => c.name.toLowerCase() === lower)
    if (ci) return ci.id
  }
  return companies[0]?.id ?? ""
}

function resolveOpportunityRoleId(
  o: Record<string, unknown>,
  roles: Role[]
): string {
  const fromId = o.role_id ?? o.roleId
  if (typeof fromId === "string" && roles.some((r) => r.id === fromId)) {
    return fromId
  }
  const legacy = String(o.role ?? "").trim()
  if (legacy) {
    const exact = roles.find((r) => r.name === legacy)
    if (exact) return exact.id
    const lower = legacy.toLowerCase()
    const ci = roles.find((r) => r.name.toLowerCase() === lower)
    if (ci) return ci.id
  }
  return roles[0]?.id ?? ""
}

/** Lê um campo aceitando tanto o nome snake_case (v4) quanto camelCase (v3 legado). */
function readField<T>(obj: Record<string, unknown>, snake: string, camel: string): T | undefined {
  const v = obj[snake] ?? obj[camel]
  return v as T | undefined
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback
}

function asBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value
  return fallback
}

function normalizeSkillIds(raw: unknown, validIds: Set<string>): string[] {
  const arr = Array.isArray(raw) ? raw : []
  const ids = arr.filter((x): x is string => typeof x === "string")
  return ids.filter((id) => validIds.has(id))
}

function parseWorkExperiences(
  raw: unknown,
  validSkillIds: Set<string>
): WorkExperience[] {
  const arr = Array.isArray(raw) ? raw : []
  const out: WorkExperience[] = []
  for (const item of arr) {
    if (!item || typeof item !== "object") continue
    const o = item as Record<string, unknown>
    if (typeof o.id !== "string") continue
    const skill_ids = normalizeSkillIds(
      o.skill_ids ?? o.skillIds,
      validSkillIds
    )
    out.push({
      id: o.id,
      title: asString(o.title),
      company_name: asString(o.company_name ?? o.companyName),
      is_remote: asBoolean(o.is_remote ?? o.isRemote),
      date_from: asString(o.date_from ?? o.dateFrom),
      date_to: asString(o.date_to ?? o.dateTo),
      skill_ids,
    })
  }
  return out
}

function parseCertifications(raw: unknown): Certification[] {
  const arr = Array.isArray(raw) ? raw : []
  const out: Certification[] = []
  for (const item of arr) {
    if (!item || typeof item !== "object") continue
    const o = item as Record<string, unknown>
    if (typeof o.id !== "string") continue
    out.push({
      id: o.id,
      name: asString(o.name),
      date_from: asString(o.date_from ?? o.dateFrom),
      date_to: asString(o.date_to ?? o.dateTo),
    })
  }
  return out
}

function parseReferenceLinks(raw: unknown): ReferenceLink[] {
  const arr = Array.isArray(raw) ? raw : []
  const out: ReferenceLink[] = []
  for (const item of arr) {
    if (!item || typeof item !== "object") continue
    const o = item as Record<string, unknown>
    if (typeof o.id !== "string") continue
    out.push({
      id: o.id,
      title: asString(o.title),
      url: asString(o.url),
    })
  }
  return out
}

function parseEducation(raw: unknown): Education[] {
  const arr = Array.isArray(raw) ? raw : []
  const out: Education[] = []
  for (const item of arr) {
    if (!item || typeof item !== "object") continue
    const o = item as Record<string, unknown>
    if (typeof o.id !== "string") continue
    out.push({
      id: o.id,
      institution_name: asString(o.institution_name ?? o.institutionName),
      degree: asString(o.degree),
      field_of_study: asString(o.field_of_study ?? o.fieldOfStudy),
      date_from: asString(o.date_from ?? o.dateFrom),
      date_to: asString(o.date_to ?? o.dateTo),
    })
  }
  return out
}

function parseResumes(
  raw: unknown,
  ctx: {
    validWorkExperienceIds: Set<string>
    validCertificationIds: Set<string>
    validEducationIds: Set<string>
    validSkillIds: Set<string>
    validRoleIds: Set<string>
  }
): ResumeDocument[] {
  const arr = Array.isArray(raw) ? raw : []
  const out: ResumeDocument[] = []
  for (const item of arr) {
    if (!item || typeof item !== "object") continue
    const o = item as Record<string, unknown>
    if (typeof o.id !== "string") continue
    const roleRaw = o.role_id ?? o.roleId
    const role_id =
      typeof roleRaw === "string" && ctx.validRoleIds.has(roleRaw) ? roleRaw : ""
    out.push({
      id: o.id,
      title: asString(o.title),
      description: asString(o.description),
      updated_at: asString(o.updated_at ?? o.updatedAt),
      role_id,
      work_experience_ids: normalizeSkillIds(
        o.work_experience_ids ?? o.workExperienceIds,
        ctx.validWorkExperienceIds
      ),
      certification_ids: normalizeSkillIds(
        o.certification_ids ?? o.certificationIds,
        ctx.validCertificationIds
      ),
      education_ids: normalizeSkillIds(
        o.education_ids ?? o.educationIds,
        ctx.validEducationIds
      ),
      skill_ids: normalizeSkillIds(o.skill_ids ?? o.skillIds, ctx.validSkillIds),
    })
  }
  return out
}

function parseStored(raw: string | null): AppDataState | null {
  if (!raw) return null
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = JSON.parse(raw) as Record<string, any>
    if (
      !Array.isArray(data.opportunities) ||
      !Array.isArray(data.companies) ||
      !Array.isArray(data.roles) ||
      !Array.isArray(data.skills)
    ) {
      return null
    }

    const opportunity_statuses = normalizeOpportunityStatuses(
      readField(data, "opportunity_statuses", "opportunityStatuses")
    )
    const validStatusIds = new Set(opportunity_statuses.map((s) => s.id))

    const rawCustomColumns = readField<unknown[]>(data, "kanban_custom_columns", "kanbanCustomColumns")
    const kanban_custom_columns: KanbanCustomColumn[] = Array.isArray(rawCustomColumns)
      ? rawCustomColumns as KanbanCustomColumn[]
      : []
    const customIds = new Set(kanban_custom_columns.map((c) => c.id))

    const rawColumnOrder = readField<unknown[]>(data, "kanban_column_order", "kanbanColumnOrder")
    const kanban_column_order: string[] = Array.isArray(rawColumnOrder)
      ? (rawColumnOrder as string[])
      : []

    const fallbackStatus = opportunity_statuses[0]!.id

    const companies: Company[] = data.companies.map((c: Record<string, unknown>) => ({
      id: c.id,
      name: c.name,
      url: c.url,
      description: c.description,
      interest_level: normalizeInterestLevel(c.interest_level ?? c.interestLevel),
    })) as Company[]

    const roles: Role[] = data.roles.map((r: Record<string, unknown>) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      interest_level: normalizeInterestLevel(r.interest_level ?? r.interestLevel),
    })) as Role[]

    const skills: Skill[] = data.skills as Skill[]
    const reference_links_raw = readField<unknown>(
      data,
      "reference_links",
      "referenceLinks"
    )
    const reference_links = parseReferenceLinks(reference_links_raw)
    const validSkillIds = new Set(skills.map((s) => s.id))
    const work_experiences_raw = readField<unknown>(
      data,
      "work_experiences",
      "workExperiences"
    )
    const work_experiences = parseWorkExperiences(work_experiences_raw, validSkillIds)
    const certifications_raw = readField<unknown>(data, "certifications", "certifications")
    const certifications = parseCertifications(
      Array.isArray(certifications_raw) ? certifications_raw : []
    )
    const education_raw = readField<unknown>(data, "education", "education")
    const education = parseEducation(Array.isArray(education_raw) ? education_raw : [])
    const resumes_raw = readField<unknown>(data, "resumes", "resumes")
    const resumes = parseResumes(Array.isArray(resumes_raw) ? resumes_raw : [], {
      validWorkExperienceIds: new Set(work_experiences.map((w) => w.id)),
      validCertificationIds: new Set(certifications.map((c) => c.id)),
      validEducationIds: new Set(education.map((e) => e.id)),
      validSkillIds,
      validRoleIds: new Set(roles.map((r) => r.id)),
    })

    return {
      ...data as Partial<AppDataState>,
      opportunity_statuses,
      opportunities: data.opportunities.map((o: Record<string, unknown>) => {
        const status = validStatusIds.has(o.status as string)
          ? (o.status as string)
          : fallbackStatus
        let board_column_id =
          (o.board_column_id as string | undefined) ??
          (o.boardColumnId as string | undefined)
        if (board_column_id != null) {
          const ok = validStatusIds.has(board_column_id) || customIds.has(board_column_id)
          if (!ok) board_column_id = undefined
        }
        const raw_interest = o.interest_level ?? o.interestLevel
        return {
          id: o.id as string,
          company_id: resolveOpportunityCompanyId(o, companies),
          role_id: resolveOpportunityRoleId(o, roles),
          description: o.description as string,
          url: o.url as string,
          status,
          interest_level: normalizeInterestLevel(raw_interest),
          board_column_id,
        } as Opportunity
      }),
      companies,
      roles,
      skills,
      reference_links,
      work_experiences,
      certifications,
      education,
      resumes,
      kanban_custom_columns,
      kanban_column_order,
    }
  } catch {
    /* ignore */
  }
  return null
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface AppDataContextValue extends AppDataState {
  addOpportunity: (row: Omit<Opportunity, "id">) => string
  updateOpportunity: (id: string, row: Omit<Opportunity, "id">) => void
  deleteOpportunity: (id: string) => void
  addKanbanColumn: (title: string) => string
  setKanbanColumnOrder: (order: string[]) => void
  addOpportunityStatus: (row: Omit<OpportunityStatusDefinition, "id">) => string
  updateOpportunityStatus: (
    id: string,
    row: Omit<OpportunityStatusDefinition, "id">
  ) => void
  deleteOpportunityStatus: (id: string) => void
  reorderOpportunityStatuses: (orderedIds: string[]) => void
  addCompany: (row: Omit<Company, "id">) => string
  updateCompany: (id: string, row: Omit<Company, "id">) => void
  deleteCompany: (id: string) => void
  addRole: (row: Omit<Role, "id">) => string
  updateRole: (id: string, row: Omit<Role, "id">) => void
  deleteRole: (id: string) => void
  addSkill: (row: Omit<Skill, "id">) => string
  updateSkill: (id: string, row: Omit<Skill, "id">) => void
  deleteSkill: (id: string) => void
  addReferenceLink: (row: Omit<ReferenceLink, "id">) => string
  updateReferenceLink: (id: string, row: Omit<ReferenceLink, "id">) => void
  deleteReferenceLink: (id: string) => void
  addWorkExperience: (row: Omit<WorkExperience, "id">) => string
  updateWorkExperience: (id: string, row: Omit<WorkExperience, "id">) => void
  deleteWorkExperience: (id: string) => void
  addCertification: (row: Omit<Certification, "id">) => string
  updateCertification: (id: string, row: Omit<Certification, "id">) => void
  deleteCertification: (id: string) => void
  addEducation: (row: Omit<Education, "id">) => string
  updateEducation: (id: string, row: Omit<Education, "id">) => void
  deleteEducation: (id: string) => void
  addResume: (row: Omit<ResumeDocument, "id">) => string
  updateResume: (id: string, row: Omit<ResumeDocument, "id">) => void
  deleteResume: (id: string) => void
}

const AppDataContext = React.createContext<AppDataContextValue | null>(null)

function defaultState(): AppDataState {
  return generateLargeMockDataset()
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AppDataState>(defaultState)
  const canPersistRef = React.useRef(false)

  React.useLayoutEffect(() => {
    if (typeof window === "undefined") return
    let raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      for (const legacyKey of LEGACY_STORAGE_KEYS) {
        raw = window.localStorage.getItem(legacyKey)
        if (raw) break
      }
    }
    const stored = parseStored(raw)
    if (stored) setState(stored)
    canPersistRef.current = true
  }, [])

  function persist(next: AppDataState) {
    if (typeof window === "undefined" || !canPersistRef.current) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }

  const value = React.useMemo<AppDataContextValue>(() => {
    return {
      ...state,
      addOpportunity: (row) => {
        const id = createId()
        setState((s) => {
          const next = { ...s, opportunities: [...s.opportunities, { id, ...row }] }
          persist(next)
          return next
        })
        return id
      },
      updateOpportunity: (id, row) => {
        setState((s) => {
          const next = {
            ...s,
            opportunities: s.opportunities.map((o) =>
              o.id === id ? { id, ...row } : o
            ),
          }
          persist(next)
          return next
        })
      },
      deleteOpportunity: (id) => {
        setState((s) => {
          const next = { ...s, opportunities: s.opportunities.filter((o) => o.id !== id) }
          persist(next)
          return next
        })
      },
      addKanbanColumn: (title) => {
        const colId = `kanban-col-${createId()}`
        const t = title.trim() || "New column"
        setState((s) => {
          const existing = s.kanban_custom_columns ?? []
          const next: AppDataState = {
            ...s,
            kanban_custom_columns: [...existing, { id: colId, title: t }],
            kanban_column_order: [...(s.kanban_column_order ?? []), colId],
          }
          persist(next)
          return next
        })
        return colId
      },
      setKanbanColumnOrder: (order) => {
        setState((s) => {
          const next: AppDataState = { ...s, kanban_column_order: [...order] }
          persist(next)
          return next
        })
      },
      addOpportunityStatus: (row) => {
        const id = `opp-st-${createId()}`
        setState((s) => {
          const def: OpportunityStatusDefinition = { id, ...row }
          const nextStatuses = [...s.opportunity_statuses, def]
          const customPart = s.kanban_column_order.filter((cid) =>
            s.kanban_custom_columns.some((c) => c.id === cid)
          )
          const next: AppDataState = {
            ...s,
            opportunity_statuses: nextStatuses,
            kanban_column_order: [...nextStatuses.map((x) => x.id), ...customPart],
          }
          persist(next)
          return next
        })
        return id
      },
      updateOpportunityStatus: (id, row) => {
        setState((s) => {
          const next: AppDataState = {
            ...s,
            opportunity_statuses: s.opportunity_statuses.map((st) =>
              st.id === id ? { id, ...row } : st
            ),
          }
          persist(next)
          return next
        })
      },
      deleteOpportunityStatus: (id) => {
        setState((s) => {
          if (s.opportunity_statuses.length <= 1) return s
          const replacement = s.opportunity_statuses.find((x) => x.id !== id)?.id
          if (!replacement) return s

          const nextStatuses = s.opportunity_statuses.filter((x) => x.id !== id)
          const customPart = s.kanban_column_order.filter((cid) =>
            s.kanban_custom_columns.some((c) => c.id === cid)
          )
          const nextOrder = [
            ...nextStatuses.map((x) => x.id),
            ...customPart,
          ].filter((cid) => cid !== id)

          const nextOpps = s.opportunities.map((o) => {
            let status = o.status
            let board_column_id = o.board_column_id
            if (status === id) status = replacement
            if (board_column_id === id) board_column_id = replacement
            return { ...o, status, board_column_id }
          })

          const next: AppDataState = {
            ...s,
            opportunity_statuses: nextStatuses,
            opportunities: nextOpps,
            kanban_column_order: nextOrder,
          }
          persist(next)
          return next
        })
      },
      reorderOpportunityStatuses: (orderedIds) => {
        setState((s) => {
          const byId = new Map(s.opportunity_statuses.map((x) => [x.id, x]))
          const next = orderedIds
            .map((id) => byId.get(id))
            .filter((x): x is OpportunityStatusDefinition => x != null)
          if (next.length !== s.opportunity_statuses.length) return s

          const customPart = s.kanban_column_order.filter((cid) =>
            s.kanban_custom_columns.some((c) => c.id === cid)
          )
          const nextState: AppDataState = {
            ...s,
            opportunity_statuses: next,
            kanban_column_order: [...next.map((x) => x.id), ...customPart],
          }
          persist(nextState)
          return nextState
        })
      },
      addCompany: (row) => {
        const id = createId()
        setState((s) => {
          const next = { ...s, companies: [...s.companies, { id, ...row }] }
          persist(next)
          return next
        })
        return id
      },
      updateCompany: (id, row) => {
        setState((s) => {
          const next = {
            ...s,
            companies: s.companies.map((c) => (c.id === id ? { id, ...row } : c)),
          }
          persist(next)
          return next
        })
      },
      deleteCompany: (id) => {
        setState((s) => {
          const next = { ...s, companies: s.companies.filter((c) => c.id !== id) }
          persist(next)
          return next
        })
      },
      addRole: (row) => {
        const id = createId()
        setState((s) => {
          const next = { ...s, roles: [...s.roles, { id, ...row }] }
          persist(next)
          return next
        })
        return id
      },
      updateRole: (id, row) => {
        setState((s) => {
          const next = {
            ...s,
            roles: s.roles.map((r) => (r.id === id ? { id, ...row } : r)),
          }
          persist(next)
          return next
        })
      },
      deleteRole: (id) => {
        setState((s) => {
          const next: AppDataState = {
            ...s,
            roles: s.roles.filter((role) => role.id !== id),
            resumes: s.resumes.map((doc) =>
              doc.role_id === id ? { ...doc, role_id: "" } : doc
            ),
          }
          persist(next)
          return next
        })
      },
      addSkill: (row) => {
        const id = createId()
        setState((s) => {
          const next = { ...s, skills: [...s.skills, { id, ...row }] }
          persist(next)
          return next
        })
        return id
      },
      updateSkill: (id, row) => {
        setState((s) => {
          const next = {
            ...s,
            skills: s.skills.map((sk) => (sk.id === id ? { id, ...row } : sk)),
          }
          persist(next)
          return next
        })
      },
      deleteSkill: (id) => {
        setState((s) => {
          const next: AppDataState = {
            ...s,
            skills: s.skills.filter((sk) => sk.id !== id),
            work_experiences: s.work_experiences.map((we) => ({
              ...we,
              skill_ids: we.skill_ids.filter((sid) => sid !== id),
            })),
            resumes: s.resumes.map((r) => ({
              ...r,
              skill_ids: r.skill_ids.filter((sid) => sid !== id),
            })),
          }
          persist(next)
          return next
        })
      },
      addReferenceLink: (row) => {
        const id = createId()
        setState((s) => {
          const next = {
            ...s,
            reference_links: [...s.reference_links, { id, ...row }],
          }
          persist(next)
          return next
        })
        return id
      },
      updateReferenceLink: (id, row) => {
        setState((s) => {
          const next = {
            ...s,
            reference_links: s.reference_links.map((link) =>
              link.id === id ? { id, ...row } : link
            ),
          }
          persist(next)
          return next
        })
      },
      deleteReferenceLink: (id) => {
        setState((s) => {
          const next = {
            ...s,
            reference_links: s.reference_links.filter((link) => link.id !== id),
          }
          persist(next)
          return next
        })
      },
      addWorkExperience: (row) => {
        const id = createId()
        setState((s) => {
          const next = { ...s, work_experiences: [...s.work_experiences, { id, ...row }] }
          persist(next)
          return next
        })
        return id
      },
      updateWorkExperience: (id, row) => {
        setState((s) => {
          const next = {
            ...s,
            work_experiences: s.work_experiences.map((we) =>
              we.id === id ? { id, ...row } : we
            ),
          }
          persist(next)
          return next
        })
      },
      deleteWorkExperience: (id) => {
        setState((s) => {
          const next: AppDataState = {
            ...s,
            work_experiences: s.work_experiences.filter((we) => we.id !== id),
            resumes: s.resumes.map((r) => ({
              ...r,
              work_experience_ids: r.work_experience_ids.filter((wid) => wid !== id),
            })),
          }
          persist(next)
          return next
        })
      },
      addCertification: (row) => {
        const id = createId()
        setState((s) => {
          const next = { ...s, certifications: [...s.certifications, { id, ...row }] }
          persist(next)
          return next
        })
        return id
      },
      updateCertification: (id, row) => {
        setState((s) => {
          const next = {
            ...s,
            certifications: s.certifications.map((c) =>
              c.id === id ? { id, ...row } : c
            ),
          }
          persist(next)
          return next
        })
      },
      deleteCertification: (id) => {
        setState((s) => {
          const next: AppDataState = {
            ...s,
            certifications: s.certifications.filter((c) => c.id !== id),
            resumes: s.resumes.map((r) => ({
              ...r,
              certification_ids: r.certification_ids.filter((cid) => cid !== id),
            })),
          }
          persist(next)
          return next
        })
      },
      addEducation: (row) => {
        const id = createId()
        setState((s) => {
          const next = { ...s, education: [...s.education, { id, ...row }] }
          persist(next)
          return next
        })
        return id
      },
      updateEducation: (id, row) => {
        setState((s) => {
          const next = {
            ...s,
            education: s.education.map((e) => (e.id === id ? { id, ...row } : e)),
          }
          persist(next)
          return next
        })
      },
      deleteEducation: (id) => {
        setState((s) => {
          const next: AppDataState = {
            ...s,
            education: s.education.filter((e) => e.id !== id),
            resumes: s.resumes.map((r) => ({
              ...r,
              education_ids: r.education_ids.filter((eid) => eid !== id),
            })),
          }
          persist(next)
          return next
        })
      },
      addResume: (row) => {
        const id = createId()
        setState((s) => {
          const next = { ...s, resumes: [...s.resumes, { id, ...row }] }
          persist(next)
          return next
        })
        return id
      },
      updateResume: (id, row) => {
        setState((s) => {
          const next = {
            ...s,
            resumes: s.resumes.map((r) => (r.id === id ? { id, ...row } : r)),
          }
          persist(next)
          return next
        })
      },
      deleteResume: (id) => {
        setState((s) => {
          const next = { ...s, resumes: s.resumes.filter((r) => r.id !== id) }
          persist(next)
          return next
        })
      },
    }
  }, [state])

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  )
}

export function useAppData() {
  const ctx = React.useContext(AppDataContext)
  if (!ctx) {
    throw new Error("useAppData must be used within AppDataProvider")
  }
  return ctx
}
