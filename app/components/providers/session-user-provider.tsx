"use client"

import * as React from "react"

const STORAGE_KEY = "job-vacancy-session-user-v1"

export interface SessionUser {
  name: string
  email: string
  phone: string
  /** Profile image URL (optional). */
  avatar: string
  bio: string
  age: string
  fullAddress: string
  relationshipStatus: string
  gender: string
}

function defaultUser(): SessionUser {
  return {
    name: "shadcn",
    email: "m@example.com",
    phone: "",
    avatar: "",
    bio: "",
    age: "",
    fullAddress: "",
    relationshipStatus: "",
    gender: "",
  }
}

function parseStored(raw: string | null): SessionUser | null {
  if (!raw) return null
  try {
    const data = JSON.parse(raw) as Partial<SessionUser>
    if (
      typeof data.name === "string" &&
      typeof data.email === "string" &&
      typeof data.avatar === "string" &&
      typeof data.bio === "string"
    ) {
      return {
        name: data.name,
        email: data.email,
        phone: typeof data.phone === "string" ? data.phone : "",
        avatar: data.avatar,
        bio: data.bio,
        age: typeof data.age === "string" ? data.age : "",
        fullAddress:
          typeof data.fullAddress === "string" ? data.fullAddress : "",
        relationshipStatus:
          typeof data.relationshipStatus === "string"
            ? data.relationshipStatus
            : "",
        gender: typeof data.gender === "string" ? data.gender : "",
      }
    }
  } catch {
    /* ignore */
  }
  return null
}

interface SessionUserContextValue {
  user: SessionUser
  updateUser: (patch: Partial<SessionUser>) => void
}

const SessionUserContext = React.createContext<SessionUserContextValue | null>(
  null
)

export function SessionUserProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = React.useState<SessionUser>(defaultUser)
  const canPersistRef = React.useRef(false)

  React.useLayoutEffect(() => {
    if (typeof window === "undefined") return
    const stored = parseStored(window.localStorage.getItem(STORAGE_KEY))
    if (stored) setUser(stored)
    canPersistRef.current = true
  }, [])

  function persist(next: SessionUser) {
    if (typeof window === "undefined" || !canPersistRef.current) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }

  const updateUser = React.useCallback((patch: Partial<SessionUser>) => {
    setUser((prev) => {
      const next = { ...prev, ...patch }
      persist(next)
      return next
    })
  }, [])

  const value = React.useMemo(
    () => ({ user, updateUser }),
    [user, updateUser]
  )

  return (
    <SessionUserContext.Provider value={value}>
      {children}
    </SessionUserContext.Provider>
  )
}

export function useSessionUser() {
  const ctx = React.useContext(SessionUserContext)
  if (!ctx) {
    throw new Error("useSessionUser must be used within SessionUserProvider")
  }
  return ctx
}
