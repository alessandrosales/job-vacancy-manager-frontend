import i18n from "i18next"
import { initReactI18next } from "react-i18next"

import {
  type UiLanguageCode,
  htmlLangToUiLanguage,
  normalizeUiLanguage,
  preferredLanguageToHtmlLang,
} from "~/lib/i18n/preferred-language"
import {
  UI_LANG_COOKIE_NAME,
  UI_LANG_COOKIE_MAX_AGE_SECONDS,
} from "~/lib/i18n/constants"

import commonEn from "~/locales/en/common.json"
import commonPtBr from "~/locales/pt_br/common.json"
import commonEs from "~/locales/es/common.json"
import pagesEn from "~/locales/en/pages.json"
import pagesPtBr from "~/locales/pt_br/pages.json"
import pagesEs from "~/locales/es/pages.json"

export const defaultI18nNs = "common" as const
export const pagesI18nNs = "pages" as const

/**
 * No SSR o bundle não tem idioma até `entry.server` chamar `changeLanguage`.
 * No cliente usa `<html lang>` (mesmo valor do loader da raiz) para bater com o HTML enviado.
 */
function computeInitialHydrationLng(): UiLanguageCode {
  if (typeof document === "undefined") return "en"
  return htmlLangToUiLanguage(document.documentElement.getAttribute("lang"))
}

const resources = {
  en: { common: commonEn, pages: pagesEn },
  pt_br: { common: commonPtBr, pages: pagesPtBr },
  es: { common: commonEs, pages: pagesEs },
} as const

const i18nInitPromise = i18n.use(initReactI18next).init({
  resources,
  lng: computeInitialHydrationLng(),
  fallbackLng: "en",
  supportedLngs: ["en", "pt_br", "es"],
  defaultNS: defaultI18nNs,
  ns: [defaultI18nNs, pagesI18nNs],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
})

export function awaitI18nReady(): Promise<typeof i18n> {
  return i18nInitPromise.then(() => i18n)
}

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
  await awaitI18nReady()
  const next = normalizeUiLanguage(code)
  if (typeof document !== "undefined") {
    syncDocumentHtmlLangAndCookie(next)
  }
  await i18n.changeLanguage(next)
}

export default i18n
