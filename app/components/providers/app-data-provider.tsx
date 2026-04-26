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

/** Bumped when o schema em localStorage ganha campos novos (ex.: status configuráveis). */
const STORAGE_KEY = "job-vacancy-app-data-v3"

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export interface Opportunity {
  id: string
  company: string
  description: string
  url: string
  role: string
  status: OpportunityStatus
  /** 0 = nenhum interesse, 5 = muito interesse. */
  interestLevel: number
  /** Coluna do Kanban; ausente = coluna padrão derivada de `status`. */
  boardColumnId?: string
}

export interface Company {
  id: string
  name: string
  url: string
  description: string
  interestLevel: InterestLevel
}

export interface Role {
  id: string
  name: string
  description: string
  interestLevel: InterestLevel
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
  /** Status das oportunidades (colunas “nativas” do Kanban). Ordem do array = ordem padrão. */
  opportunityStatuses: OpportunityStatusDefinition[]
  /** Colunas extras do Kanban (além dos status). */
  kanbanCustomColumns: KanbanCustomColumn[]
  /** Ordem persistida das colunas (status + custom). */
  kanbanColumnOrder: string[]
}

function defaultState(): AppDataState {
  return generateLargeMockDataset()
}

function normalizeOpportunityStatuses(
  raw: unknown
): OpportunityStatusDefinition[] {
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

function parseStored(raw: string | null): AppDataState | null {
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as AppDataState
    if (
      Array.isArray(data.opportunities) &&
      Array.isArray(data.companies) &&
      Array.isArray(data.roles) &&
      Array.isArray(data.skills)
    ) {
      const opportunityStatuses = normalizeOpportunityStatuses(
        data.opportunityStatuses
      )
      const validStatusIds = new Set(opportunityStatuses.map((s) => s.id))
      const customColumns = Array.isArray(data.kanbanCustomColumns)
        ? data.kanbanCustomColumns
        : []
      const customIds = new Set(customColumns.map((c) => c.id))
      const fallbackStatus = opportunityStatuses[0]!.id

      return {
        ...data,
        opportunityStatuses,
        opportunities: data.opportunities.map((o) => {
          const status = validStatusIds.has(o.status) ? o.status : fallbackStatus
          let boardColumnId = o.boardColumnId
          if (boardColumnId != null) {
            const ok =
              validStatusIds.has(boardColumnId) || customIds.has(boardColumnId)
            if (!ok) boardColumnId = undefined
          }
          return {
            ...o,
            status,
            interestLevel: normalizeInterestLevel(o.interestLevel),
            boardColumnId,
          }
        }),
        companies: data.companies.map((c) => ({
          ...c,
          interestLevel: normalizeInterestLevel(c.interestLevel),
        })),
        roles: data.roles.map((r) => ({
          ...r,
          interestLevel: normalizeInterestLevel(r.interestLevel),
        })),
        kanbanCustomColumns: customColumns,
        kanbanColumnOrder: Array.isArray(data.kanbanColumnOrder)
          ? data.kanbanColumnOrder
          : [],
      }
    }
  } catch {
    /* ignore */
  }
  return null
}

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

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<AppDataState>(defaultState)
  const canPersistRef = React.useRef(false)

  React.useLayoutEffect(() => {
    if (typeof window === "undefined") return
    let raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      raw = window.localStorage.getItem("job-vacancy-app-data-v2")
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
          const next = {
            ...s,
            opportunities: [...s.opportunities, { id, ...row }],
          }
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
          const next = {
            ...s,
            opportunities: s.opportunities.filter((o) => o.id !== id),
          }
          persist(next)
          return next
        })
      },
      addKanbanColumn: (title) => {
        const colId = `kanban-col-${createId()}`
        const t = title.trim() || "New column"
        setState((s) => {
          const existing = s.kanbanCustomColumns ?? []
          const next: AppDataState = {
            ...s,
            kanbanCustomColumns: [...existing, { id: colId, title: t }],
            kanbanColumnOrder: [...(s.kanbanColumnOrder ?? []), colId],
          }
          persist(next)
          return next
        })
        return colId
      },
      setKanbanColumnOrder: (order) => {
        setState((s) => {
          const next: AppDataState = {
            ...s,
            kanbanColumnOrder: [...order],
          }
          persist(next)
          return next
        })
      },
      addOpportunityStatus: (row) => {
        const id = `opp-st-${createId()}`
        setState((s) => {
          const def: OpportunityStatusDefinition = { id, ...row }
          const nextStatuses = [...s.opportunityStatuses, def]
          const customPart = s.kanbanColumnOrder.filter((cid) =>
            s.kanbanCustomColumns.some((c) => c.id === cid)
          )
          const next: AppDataState = {
            ...s,
            opportunityStatuses: nextStatuses,
            kanbanColumnOrder: [...nextStatuses.map((x) => x.id), ...customPart],
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
            opportunityStatuses: s.opportunityStatuses.map((st) =>
              st.id === id ? { id, ...row } : st
            ),
          }
          persist(next)
          return next
        })
      },
      deleteOpportunityStatus: (id) => {
        setState((s) => {
          if (s.opportunityStatuses.length <= 1) {
            return s
          }
          const replacement = s.opportunityStatuses.find((x) => x.id !== id)?.id
          if (!replacement) return s

          const nextStatuses = s.opportunityStatuses.filter((x) => x.id !== id)
          const customPart = s.kanbanColumnOrder.filter((cid) =>
            s.kanbanCustomColumns.some((c) => c.id === cid)
          )
          const nextOrder = [
            ...nextStatuses.map((x) => x.id),
            ...customPart,
          ].filter((cid) => cid !== id)

          const nextOpps = s.opportunities.map((o) => {
            let status = o.status
            let boardColumnId = o.boardColumnId
            if (status === id) status = replacement
            if (boardColumnId === id) boardColumnId = replacement
            return { ...o, status, boardColumnId }
          })

          const next: AppDataState = {
            ...s,
            opportunityStatuses: nextStatuses,
            opportunities: nextOpps,
            kanbanColumnOrder: nextOrder,
          }
          persist(next)
          return next
        })
      },
      reorderOpportunityStatuses: (orderedIds) => {
        setState((s) => {
          const byId = new Map(s.opportunityStatuses.map((x) => [x.id, x]))
          const next = orderedIds
            .map((id) => byId.get(id))
            .filter((x): x is OpportunityStatusDefinition => x != null)
          if (next.length !== s.opportunityStatuses.length) return s

          const customPart = s.kanbanColumnOrder.filter((cid) =>
            s.kanbanCustomColumns.some((c) => c.id === cid)
          )
          const nextState: AppDataState = {
            ...s,
            opportunityStatuses: next,
            kanbanColumnOrder: [...next.map((x) => x.id), ...customPart],
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
          const next = {
            ...s,
            companies: s.companies.filter((c) => c.id !== id),
          }
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
