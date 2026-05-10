import { create } from "zustand"
import { createJSONStorage, devtools, persist } from "zustand/middleware"

import type { ApiSessionUser } from "~/lib/api/resources/auth"

const LEGACY_SESSION_KEY = "job-vacancy-session-user-v1"
const PERSIST_KEY = "job-vacancy-store-session-v1"
const PERSIST_VERSION = 7

function sessionFieldsFromApiUser(api: ApiSessionUser): SessionUser {
  return {
    id: api.id,
    name: api.name,
    email: api.email,
    phone: api.phone ?? "",
    avatar_url: api.avatar_url ?? "",
    bio: api.bio ?? "",
    age: api.age != null ? String(api.age) : "",
    full_address: api.full_address ?? "",
    relationship_status: api.relationship_status ?? "",
    gender: api.gender ?? "",
    preferred_language: api.preferred_language ?? "en",
    ai_token_configured: api.ai_token_configured ?? false,
    created_at: api.created_at,
    updated_at: api.updated_at,
  }
}

/**
 * Perfil em sessão (snake_case). Alinhado a `User#as_api_json` / `GET /auth/me`.
 */
export interface SessionUser {
  id: string
  name: string
  email: string
  phone: string
  avatar_url: string
  bio: string
  age: string
  full_address: string
  relationship_status: string
  gender: string
  preferred_language: string
  ai_token_configured: boolean
  created_at: string
  updated_at: string
}

export function defaultSessionUser(): SessionUser {
  return {
    id: "",
    name: "",
    email: "",
    phone: "",
    avatar_url: "",
    bio: "",
    age: "",
    full_address: "",
    relationship_status: "",
    gender: "",
    preferred_language: "en",
    ai_token_configured: false,
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
            () => ({
              user: sessionFieldsFromApiUser(apiUser),
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
        migrate: (persistedState, oldVersion) => {
          const state = persistedState as { user?: Record<string, unknown> }
          if (oldVersion < 4 && state.user && typeof state.user === "object") {
            const u = state.user
            const avatar_url =
              typeof u.avatar_url === "string"
                ? u.avatar_url
                : typeof u.avatar === "string"
                  ? u.avatar
                  : ""
            const { avatar: _removed, ...rest } = u
            return { ...state, user: { ...rest, avatar_url } }
          }
          if (oldVersion < 5 && state.user && typeof state.user === "object") {
            const u = state.user as Record<string, unknown>
            return {
              ...state,
              user: {
                ...u,
                preferred_language:
                  typeof u.preferred_language === "string"
                    ? u.preferred_language
                    : "en",
              },
            }
          }
          if (oldVersion < 6 && state.user && typeof state.user === "object") {
            const u = state.user as Record<string, unknown>
            const pl =
              typeof u.preferred_language === "string"
                ? u.preferred_language
                : "en"
            return {
              ...state,
              user: {
                ...u,
                preferred_language: pl === "pt-br" ? "pt_br" : pl,
              },
            }
          }
          if (oldVersion < 7 && state.user && typeof state.user === "object") {
            const u = state.user as Record<string, unknown>
            return {
              ...state,
              user: {
                ...u,
                ai_token_configured: u.ai_token_configured === true,
              },
            }
          }
          return persistedState as { user: SessionUser }
        },
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
