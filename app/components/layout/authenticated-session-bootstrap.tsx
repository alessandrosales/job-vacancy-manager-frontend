"use client"

import * as React from "react"
import { useNavigate } from "react-router"

import { ApiError } from "~/lib/api/errors"
import { fetchAuthMe } from "~/lib/api/resources/auth"
import { getAuthToken } from "~/lib/auth-token"
import { clearAuthSession } from "~/stores/clear-auth-session"
import { rehydrateAppStores } from "~/stores/rehydrate-app-stores"
import { useSessionUserStore } from "~/stores/session-user-store"

/**
 * Layout autenticado: primeiro reidrata os stores (token + perfil persistidos),
 * depois `GET /auth/me` para alinhar com a API. Evita corrida com o persist.
 */
export function AuthenticatedSessionBootstrap() {
  const navigate = useNavigate()

  React.useEffect(() => {
    const ac = new AbortController()

    void (async () => {
      await rehydrateAppStores()
      if (ac.signal.aborted) return

      const token = getAuthToken()
      if (!token) return

      const session = useSessionUserStore.getState()
      if (session.me_synced_for_token === token && session.user.id !== "") {
        return
      }

      try {
        const apiUser = await fetchAuthMe({ signal: ac.signal })
        if (ac.signal.aborted) return
        useSessionUserStore.getState().hydrateFromAuthMeResponse(token, apiUser)
      } catch (err: unknown) {
        if (ac.signal.aborted) return
        if (err instanceof ApiError && err.status === 401) {
          clearAuthSession()
          navigate("/login", { replace: true })
        }
      }
    })()

    return () => ac.abort()
  }, [navigate])

  return null
}
