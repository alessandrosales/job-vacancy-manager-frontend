export type UiLanguageCode = "en" | "pt_br" | "es"

export const UI_LANGUAGE_CODES: readonly UiLanguageCode[] = ["en", "pt_br", "es"]

/** Alinhado a `parseApiSessionUser`: `en` | `pt_br` | `es` + legado `pt-br`. */
export function normalizeUiLanguage(raw: string): UiLanguageCode {
  if (raw === "pt-br") return "pt_br"
  if (raw === "en" || raw === "pt_br" || raw === "es") return raw
  return "en"
}

export function preferredLanguageToHtmlLang(code: UiLanguageCode): string {
  if (code === "pt_br") return "pt-BR"
  return code
}

export function acceptLanguageToUi(header: string | null): UiLanguageCode {
  if (!header || !header.trim()) return "en"
  const first = header.split(",")[0]?.trim().split(";")[0]?.trim()
  const base = first?.split("-")[0]?.toLowerCase()
  if (base === "pt") return "pt_br"
  if (base === "es") return "es"
  return "en"
}
