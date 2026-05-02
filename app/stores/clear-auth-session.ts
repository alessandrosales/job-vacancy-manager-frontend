import { useAuthStore } from "~/stores/auth-store"
import { useSessionUserStore } from "~/stores/session-user-store"

/** Limpa JWT e perfil local (logout). */
export function clearAuthSession(): void {
  useAuthStore.getState().clearToken()
  useSessionUserStore.getState().resetUser()
}
