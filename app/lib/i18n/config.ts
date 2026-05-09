import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import {
  type UiLanguageCode,
  normalizeUiLanguage,
  preferredLanguageToHtmlLang,
} from "~/lib/i18n/preferred-language"
import { parseUiLangFromCookieHeader } from "~/lib/i18n/cookie"
import {
  UI_LANG_COOKIE_NAME,
  UI_LANG_COOKIE_MAX_AGE_SECONDS,
} from "~/lib/i18n/constants"

import commonEn from "~/locales/en/common.json"
import commonPtBr from "~/locales/pt_br/common.json"
import commonEs from "~/locales/es/common.json"

export const defaultI18nNs = "common" as const

function initialLngFromDocument(): UiLanguageCode {
  if (typeof document === "undefined") return "en"
  return parseUiLangFromCookieHeader(document.cookie) ?? "en"
}

const resources = {
  en: { common: commonEn },
  pt_br: { common: commonPtBr },
  es: { common: commonEs },
} as const

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLngFromDocument(),
  fallbackLng: "en",
  supportedLngs: ["en", "pt_br", "es"],
  defaultNS: defaultI18nNs,
  ns: [defaultI18nNs],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
})

export function syncDocumentHtmlLangAndCookie(code: UiLanguageCode): void {
  if (typeof document === "undefined") return
  document.documentElement.lang = preferredLanguageToHtmlLang(code)
  const encoded = encodeURIComponent(code)
  document.cookie = `${UI_LANG_COOKIE_NAME}=${encoded}; Path=/; SameSite=Lax; Max-Age=${String(UI_LANG_COOKIE_MAX_AGE_SECONDS)}`
}

/**
 * Troca idioma da UI + `lang`/`cookie` quando rodando no navegador.
 */
export async function syncAppLanguageTo(code: UiLanguageCode): Promise<void> {
  const next = normalizeUiLanguage(code)
  if (typeof document !== "undefined") {
    syncDocumentHtmlLangAndCookie(next)
  }
  await i18n.changeLanguage(next)
}

export default i18n
