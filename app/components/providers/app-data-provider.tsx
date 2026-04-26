"use client"

import * as React from "react"

import type { InterestLevel, OpportunityStatus } from "~/lib/labels"

const STORAGE_KEY = "job-vacancy-app-data-v1"

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
  return {
    opportunities: [
      {
        id: "opp-1",
        company: "Acme Corp",
        description:
          "Build and maintain React-based interfaces for internal tools.",
        url: "https://acme.example.com/jobs/1",
        role: "Frontend Developer",
        status: "INTERESTED IN",
      },
      {
        id: "opp-2",
        company: "Globex",
        description: "Design end-to-end user flows for the new product suite.",
        url: "https://globex.example.com/jobs/42",
        role: "UX Designer",
        status: "SENT RESUME",
      },
      {
        id: "opp-3",
        company: "Initech",
        description: "Own the full stack from API design to React components.",
        url: "https://initech.example.com/careers/12",
        role: "Full Stack Engineer",
        status: "SCHEDULED INTERVIEW",
      },
      {
        id: "opp-4",
        company: "Umbrella Ltd",
        description:
          "Drive product strategy and work closely with engineering teams.",
        url: "https://umbrella.example.com/open-roles/7",
        role: "Product Manager",
        status: "WAITING RESPONSE",
      },
      {
        id: "opp-5",
        company: "Hooli",
        description: "Implement accessible, performant UI components at scale.",
        url: "https://hooli.example.com/jobs/99",
        role: "React Developer",
        status: "INTERESTED IN",
      },
      {
        id: "opp-6",
        company: "Pied Piper",
        description: "Lead front-end development for a fast-growing startup.",
        url: "https://piedpiper.example.com/careers",
        role: "Lead Frontend Engineer",
        status: "SENT RESUME",
      },
    ],
    companies: [
      {
        id: "co-1",
        name: "Acme Corp",
        url: "https://acme.example.com",
        description: "Global leader in innovative consumer products.",
        interestLevel: "High",
      },
      {
        id: "co-2",
        name: "Globex",
        url: "https://globex.example.com",
        description: "Technology and manufacturing conglomerate.",
        interestLevel: "Medium",
      },
      {
        id: "co-3",
        name: "Initech",
        url: "https://initech.example.com",
        description: "Enterprise software and consulting services.",
        interestLevel: "Low",
      },
      {
        id: "co-4",
        name: "Umbrella Ltd",
        url: "https://umbrella.example.com",
        description: "Pharmaceutical and research corporation.",
        interestLevel: "Medium",
      },
      {
        id: "co-5",
        name: "Hooli",
        url: "https://hooli.example.com",
        description: "Silicon Valley tech giant with diverse product lines.",
        interestLevel: "High",
      },
      {
        id: "co-6",
        name: "Pied Piper",
        url: "https://piedpiper.example.com",
        description: "Compression technology startup disrupting the market.",
        interestLevel: "High",
      },
    ],
    roles: [
      {
        id: "ro-1",
        name: "Frontend Developer",
        description: "Builds UIs using modern frameworks like React and Vue.",
        interestLevel: "High",
      },
      {
        id: "ro-2",
        name: "Full Stack Engineer",
        description: "Handles both client-side and server-side development.",
        interestLevel: "High",
      },
      {
        id: "ro-3",
        name: "UX Designer",
        description: "Designs user flows, wireframes and prototypes.",
        interestLevel: "Medium",
      },
      {
        id: "ro-4",
        name: "Product Manager",
        description: "Defines product vision and coordinates between teams.",
        interestLevel: "Low",
      },
      {
        id: "ro-5",
        name: "React Developer",
        description:
          "Specialises in React ecosystem, including Next.js and libraries.",
        interestLevel: "High",
      },
      {
        id: "ro-6",
        name: "DevOps Engineer",
        description: "Manages CI/CD pipelines, infrastructure and deployments.",
        interestLevel: "Medium",
      },
    ],
    skills: [
      {
        id: "sk-1",
        name: "React",
        description:
          "Component-based JavaScript library for building user interfaces.",
      },
      {
        id: "sk-2",
        name: "TypeScript",
        description:
          "Typed superset of JavaScript that compiles to plain JavaScript.",
      },
      {
        id: "sk-3",
        name: "Tailwind CSS",
        description: "Utility-first CSS framework for rapid UI development.",
      },
      {
        id: "sk-4",
        name: "Node.js",
        description:
          "JavaScript runtime for building scalable server-side applications.",
      },
      {
        id: "sk-5",
        name: "PostgreSQL",
        description:
          "Open-source relational database system with strong standards compliance.",
      },
      {
        id: "sk-6",
        name: "Docker",
        description:
          "Platform for building, shipping and running containerised applications.",
      },
      {
        id: "sk-7",
        name: "Git",
        description:
          "Distributed version control system for tracking code changes.",
      },
    ],
  }
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
