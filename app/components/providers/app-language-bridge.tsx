"use client"

import * as React from "react"
import { useAuthStore } from "~/stores/auth-store"
import { rehydrateAppStores } from "~/stores/rehydrate-app-stores"
import { useSessionUserStore } from "~/stores/session-user-store"
import type { UiLanguageCode } from "~/lib/i18n/preferred-language"
import {
  acceptLanguageToUi,
  normalizeUiLanguage,
} from "~/lib/i18n/preferred-language"
import { syncAppLanguageTo } from "~/lib/i18n/config"
import {
  persistGuestUiLanguage,
  readGuestUiLanguage,
} from "~/lib/i18n/guest-ui-lang-storage"

function guestLanguageFromNavigator(): UiLanguageCode {
  if (typeof navigator === "undefined") return "en"
  return acceptLanguageToUi(navigator.language)
}

/**
 * Sincroniza i18next + `<html lang>` + cookie com `preferred_language` do perfil
 * (logado) ou com preferência local / navegador (convidado).
 */
export function AppLanguageBridge() {
  const token = useAuthStore((s) => s.token)
  const userId = useSessionUserStore((s) => s.user.id)
  const preferredLanguage = useSessionUserStore(
    (s) => s.user.preferred_language
  )

  React.useLayoutEffect(() => {
    const ac = new AbortController()

    void (async () => {
      await rehydrateAppStores()
      if (ac.signal.aborted) return

      const t = useAuthStore.getState().token
      const u = useSessionUserStore.getState().user

      let code: UiLanguageCode
      if (t && u.id) {
        code = normalizeUiLanguage(u.preferred_language)
      } else {
        code = readGuestUiLanguage() ?? guestLanguageFromNavigator()
        persistGuestUiLanguage(code)
      }

      await syncAppLanguageTo(code)
    })()

    return () => ac.abort()
  }, [token, userId, preferredLanguage])

  return null
}
