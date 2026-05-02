import { LEGACY_TOKEN_KEY, useAuthStore } from "~/stores/auth-store"
import { useSessionUserStore } from "~/stores/session-user-store"

let hydrationPromise: Promise<void> | null = null

/**
 * Reidrata auth + session a partir do `localStorage` (uma vez por carga;
 * chamadas repetidas compartilham a mesma Promise).
 */
export function rehydrateAppStores(): Promise<void> {
  if (!hydrationPromise) {
    hydrationPromise = (async () => {
      await Promise.all([
        useAuthStore.persist.rehydrate(),
        useSessionUserStore.persist.rehydrate(),
      ])

      if (!useAuthStore.getState().token) {
        try {
          const leg = localStorage.getItem(LEGACY_TOKEN_KEY)
          if (leg) useAuthStore.getState().setToken(leg)
        } catch {
          /* ignore */
        }
      }
    })()
  }
  return hydrationPromise
}
