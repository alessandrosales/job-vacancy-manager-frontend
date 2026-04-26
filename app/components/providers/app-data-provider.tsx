"use client"

import * as React from "react"

import { generateLargeMockDataset } from "~/lib/mock-seed"
import type { InterestLevel, OpportunityStatus } from "~/lib/labels"

/** Bumped so new installs pick up the large mock seed; clear storage to reset. */
const STORAGE_KEY = "job-vacancy-app-data-v2"

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

export interface AppDataState {
  opportunities: Opportunity[]
  companies: Company[]
  roles: Role[]
  skills: Skill[]
}

function defaultState(): AppDataState {
  return generateLargeMockDataset()
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
      return data
    }
  } catch {
    /* ignore */
  }
  return null
}

interface AppDataContextValue extends AppDataState {
  addOpportunity: (row: Omit<Opportunity, "id">) => string
  updateOpportunity: (id: string, row: Omit<Opportunity, "id">) => void
  deleteOpportunity: (id: string) => void
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
    const stored = parseStored(window.localStorage.getItem(STORAGE_KEY))
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

  // Fix getters to read latest state from closure in setState callbacks is wrong for getOpportunity - they use `state` from render when value was built. Actually getOpportunity uses `state.opportunities` from outer closure - it's stale when called from child after update... The useMemo deps [state] so when state updates, new value with fresh getOpportunity. Good.

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
