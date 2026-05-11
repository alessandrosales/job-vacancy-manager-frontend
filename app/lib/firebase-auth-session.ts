import type { User } from "firebase/auth"

import { loginWithFirebaseIdToken } from "~/lib/api/resources/auth"
import { setAuthToken } from "~/lib/auth-token"
import { useSessionUserStore } from "~/stores/session-user-store"
import type { UiLanguageCode } from "~/lib/i18n/preferred-language"

/** Firebase user → JWT da API Rails + hydrate do store local. */
export async function syncFirebaseUserToApiSession(
  user: User,
  options?: {
    /**
     * Idioma escolhido pelo visitante (landing/login). Só é aplicado no backend
     * quando uma conta nova é criada via Firebase; logins de retorno preservam
     * o `preferred_language` que o usuário já tem salvo.
     */
    preferred_language?: UiLanguageCode
  }
): Promise<void> {
  /** Após OAuth (popup), garantir token fresco para o backend. */
  const firebaseIdToken = await user.getIdToken(true)
  const session = await loginWithFirebaseIdToken(firebaseIdToken, {
    preferred_language: options?.preferred_language,
  })
  setAuthToken(session.token)
  useSessionUserStore
    .getState()
    .hydrateFromAuthMeResponse(session.token, session.user)
}
