export type UiLanguageCode = "en" | "pt_br" | "es"

export const UI_LANGUAGE_CODES: readonly UiLanguageCode[] = [
  "en",
  "pt_br",
  "es",
]

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

/** Inverso de `preferredLanguageToHtmlLang` para alinhar o cliente ao `<html lang>`. */
export function htmlLangToUiLanguage(
  htmlLang: string | null | undefined
): UiLanguageCode {
  if (!htmlLang?.trim()) return "en"
  const lang = htmlLang.trim().toLowerCase()
  if (lang.startsWith("pt")) return "pt_br"
  if (lang.startsWith("es")) return "es"
  return "en"
}

export function acceptLanguageToUi(header: string | null): UiLanguageCode {
  if (!header || !header.trim()) return "en"
  const first = header.split(",")[0]?.trim().split(";")[0]?.trim()
  const base = first?.split("-")[0]?.toLowerCase()
  if (base === "pt") return "pt_br"
  if (base === "es") return "es"
  return "en"
}
