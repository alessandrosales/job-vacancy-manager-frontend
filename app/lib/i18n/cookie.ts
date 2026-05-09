import {
  type UiLanguageCode,
  normalizeUiLanguage,
} from "~/lib/i18n/preferred-language"
import { UI_LANG_COOKIE_NAME } from "~/lib/i18n/constants"

export function parseUiLangFromCookieHeader(
  cookieHeader: string | null | undefined,
  name: string = UI_LANG_COOKIE_NAME
): UiLanguageCode | null {
  if (!cookieHeader) return null
  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim()
    const eq = trimmed.indexOf("=")
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    if (key !== name) continue
    const raw = trimmed.slice(eq + 1).trim()
    try {
      return normalizeUiLanguage(decodeURIComponent(raw))
    } catch {
      return normalizeUiLanguage(raw)
    }
  }
  return null
}
