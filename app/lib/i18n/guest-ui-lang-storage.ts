import { GUEST_UI_LANG_STORAGE_KEY } from "~/lib/i18n/constants"
import {
  normalizeUiLanguage,
  type UiLanguageCode,
} from "~/lib/i18n/preferred-language"

export function readGuestUiLanguage(): UiLanguageCode | null {
  try {
    const raw = localStorage.getItem(GUEST_UI_LANG_STORAGE_KEY)
    if (!raw) return null
    return normalizeUiLanguage(raw)
  } catch {
    return null
  }
}

export function persistGuestUiLanguage(code: UiLanguageCode): void {
  try {
    localStorage.setItem(GUEST_UI_LANG_STORAGE_KEY, code)
  } catch {
    /* ignore */
  }
}
