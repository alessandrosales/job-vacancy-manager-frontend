import type { User } from "firebase/auth"

import { loginWithFirebaseIdToken } from "~/lib/api/resources/auth"
import { setAuthToken } from "~/lib/auth-token"
import { useSessionUserStore } from "~/stores/session-user-store"

/** Firebase user → JWT da API Rails + hydrate do store local. */
export async function syncFirebaseUserToApiSession(user: User): Promise<void> {
  /** Após OAuth (popup), garantir token fresco para o backend. */
  const firebaseIdToken = await user.getIdToken(true)
  const session = await loginWithFirebaseIdToken(firebaseIdToken)
  setAuthToken(session.token)
  useSessionUserStore
    .getState()
    .hydrateFromAuthMeResponse(session.token, session.user)
}
