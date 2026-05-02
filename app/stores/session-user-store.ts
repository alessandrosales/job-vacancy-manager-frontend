import { create } from "zustand"
import { createJSONStorage, devtools, persist } from "zustand/middleware"

import type { ApiSessionUser } from "~/lib/api/resources/auth"

const LEGACY_SESSION_KEY = "job-vacancy-session-user-v1"
const PERSIST_KEY = "job-vacancy-store-session-v1"
const PERSIST_VERSION = 3

/**
 * Perfil em sessão (snake_case). Campos `id`, `created_at`, `updated_at`
 * vêm de `GET /auth/me`; o restante é UI local até integrar com a API.
 */
export interface SessionUser {
  id: string
  name: string
  email: string
  phone: string
  /** Profile image URL (optional). */
  avatar: string
  bio: string
  age: string
  full_address: string
  relationship_status: string
  gender: string
  created_at: string
  updated_at: string
}

export function defaultSessionUser(): SessionUser {
  return {
    id: "",
    name: "shadcn",
    email: "m@example.com",
    phone: "",
    avatar: "",
    bio: "",
    age: "",
    full_address: "",
    relationship_status: "",
    gender: "",
    created_at: "",
    updated_at: "",
  }
}

function stripLegacySessionKey(): void {
  try {
    localStorage.removeItem(LEGACY_SESSION_KEY)
  } catch {
    /* ignore */
  }
}

interface SessionUserStoreState {
  user: SessionUser
  /** Não persistido: evita refetch desnecessário ao trocar de rota com o mesmo JWT. */
  me_synced_for_token: string | null
  updateUser: (patch: Partial<SessionUser>) => void
  resetUser: () => void
  invalidateMeSync: () => void
  hydrateFromAuthMeResponse: (token: string, apiUser: ApiSessionUser) => void
}

export const useSessionUserStore = create<SessionUserStoreState>()(
  devtools(
    persist(
      (set) => ({
        user: defaultSessionUser(),
        me_synced_for_token: null,
        updateUser: (patch) =>
          set(
            (s) => {
              stripLegacySessionKey()
              return { user: { ...s.user, ...patch } }
            },
            false,
            "session/updateUser"
          ),
        resetUser: () =>
          set(
            () => {
              stripLegacySessionKey()
              return {
                user: defaultSessionUser(),
                me_synced_for_token: null,
              }
            },
            false,
            "session/resetUser"
          ),
        invalidateMeSync: () =>
          set({ me_synced_for_token: null }, false, "session/invalidateMeSync"),
        hydrateFromAuthMeResponse: (token, apiUser) =>
          set(
            (s) => ({
              user: {
                ...s.user,
                id: apiUser.id,
                name: apiUser.name,
                email: apiUser.email,
                created_at: apiUser.created_at,
                updated_at: apiUser.updated_at,
              },
              me_synced_for_token: token,
            }),
            false,
            "session/hydrateFromAuthMe"
          ),
      }),
      {
        name: PERSIST_KEY,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ user: state.user }),
        version: PERSIST_VERSION,
        skipHydration: true,
      }
    ),
    {
      name: "job-vacancy-session-user",
      enabled: import.meta.env.DEV,
    }
  )
)

/** Assinaturas separadas reduzem re-renders (vercel-react-best-practices / rerender). */
export function useSessionUser(): {
  user: SessionUser
  updateUser: (patch: Partial<SessionUser>) => void
} {
  const user = useSessionUserStore((s) => s.user)
  const updateUser = useSessionUserStore((s) => s.updateUser)
  return { user, updateUser }
}
