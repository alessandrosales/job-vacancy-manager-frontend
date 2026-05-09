import { GUEST_UI_LANG_STORAGE_KEY } from "~/lib/i18n/constants"
import { normalizeUiLanguage } from "~/lib/i18n/preferred-language"
import { useAuthStore } from "~/stores/auth-store"
import { useSessionUserStore } from "~/stores/session-user-store"

/** Limpa JWT e perfil local (logout). */
export function clearAuthSession(): void {
  try {
    const pl = useSessionUserStore.getState().user.preferred_language
    localStorage.setItem(GUEST_UI_LANG_STORAGE_KEY, normalizeUiLanguage(pl))
  } catch {
    /* ignore */
  }
  useAuthStore.getState().clearToken()
  useSessionUserStore.getState().resetUser()
}
