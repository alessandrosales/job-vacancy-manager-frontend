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
  company: string
  description: string
  url: string
  role: string
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

export interface KanbanCustomColumn {
  id: string
  title: string
}

export interface AppDataState {
  opportunities: Opportunity[]
  companies: Company[]
  roles: Role[]
  skills: Skill[]
  /** Status das oportunidades (colunas "nativas" do Kanban). Ordem do array = ordem padrão. */
  opportunity_statuses: OpportunityStatusDefinition[]
  /** Colunas extras do Kanban (além dos status). */
  kanban_custom_columns: KanbanCustomColumn[]
  /** Ordem persistida das colunas (status + custom). */
  kanban_column_order: string[]
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

/** Lê um campo aceitando tanto o nome snake_case (v4) quanto camelCase (v3 legado). */
function readField<T>(obj: Record<string, unknown>, snake: string, camel: string): T | undefined {
  const v = obj[snake] ?? obj[camel]
  return v as T | undefined
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
          id: o.id,
          company: o.company,
          description: o.description,
          url: o.url,
          role: o.role,
          status,
          interest_level: normalizeInterestLevel(raw_interest),
          board_column_id,
        } as Opportunity
      }),
      companies: data.companies.map((c: Record<string, unknown>) => ({
        id: c.id,
        name: c.name,
        url: c.url,
        description: c.description,
        interest_level: normalizeInterestLevel(c.interest_level ?? c.interestLevel),
      })) as Company[],
      roles: data.roles.map((r: Record<string, unknown>) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        interest_level: normalizeInterestLevel(r.interest_level ?? r.interestLevel),
      })) as Role[],
      skills: data.skills as Skill[],
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
          const next = { ...s, roles: s.roles.filter((r) => r.id !== id) }
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
          const next = { ...s, skills: s.skills.filter((sk) => sk.id !== id) }
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
