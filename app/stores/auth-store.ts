import { create } from "zustand"
import { createJSONStorage, devtools, persist } from "zustand/middleware"

import { useSessionUserStore } from "~/stores/session-user-store"

export const LEGACY_TOKEN_KEY = "job-vacancy-api-token-v1"
const PERSIST_KEY = "job-vacancy-store-auth-v1"

export interface AuthStoreState {
  token: string | null
  setToken: (token: string) => void
  clearToken: () => void
}

function stripLegacyTokenKey(): void {
  try {
    localStorage.removeItem(LEGACY_TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

export const useAuthStore = create<AuthStoreState>()(
  devtools(
    persist(
      (set) => ({
        token: null,
        setToken: (token) => {
          stripLegacyTokenKey()
          useSessionUserStore.getState().invalidateMeSync()
          set({ token }, false, "auth/setToken")
        },
        clearToken: () => {
          stripLegacyTokenKey()
          useSessionUserStore.getState().invalidateMeSync()
          set({ token: null }, false, "auth/clearToken")
        },
      }),
      {
        name: PERSIST_KEY,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({ token: state.token }),
        version: 1,
        skipHydration: true,
      }
    ),
    {
      name: "job-vacancy-auth",
      enabled: import.meta.env.DEV,
    }
  )
)

/** Assina só o token (menos re-renders). */
export function useAuthToken(): string | null {
  return useAuthStore((s) => s.token)
}
