/** Alinhado ao backend: `Resume::PREFERRED_LANGUAGES` e `db.mermaid` (resumes). */
export const RESUME_PREFERRED_LANGUAGE_CODES = ["en", "pt_br", "es"] as const

export type ResumePreferredLanguage =
  (typeof RESUME_PREFERRED_LANGUAGE_CODES)[number]

export const DEFAULT_RESUME_PREFERRED_LANGUAGE: ResumePreferredLanguage = "en"

export const RESUME_PREFERRED_LANGUAGE_OPTIONS: ReadonlyArray<{
  value: ResumePreferredLanguage
  label: string
}> = [
  { value: "en", label: "English" },
  { value: "pt_br", label: "Português (Brasil)" },
  { value: "es", label: "Español" },
]

/** Idioma inicial em formulários de currículo novo: alinha ao `preferred_language` do perfil (en / pt_br / es). */
export function defaultResumePreferredLanguageForUser(
  userPreferredLanguage: unknown
): ResumePreferredLanguage {
  return normalizeResumePreferredLanguage(userPreferredLanguage)
}

/** Normaliza códigos vindos da API / legado (hífen, camelCase, caixa). */
export function normalizeResumePreferredLanguage(
  raw: unknown
): ResumePreferredLanguage {
  let s =
    typeof raw === "string"
      ? raw.trim()
      : typeof raw === "number"
        ? String(raw).trim()
        : ""
  if (!s) return DEFAULT_RESUME_PREFERRED_LANGUAGE

  s = s.toLowerCase().replace(/-/g, "_")

  if ((RESUME_PREFERRED_LANGUAGE_CODES as readonly string[]).includes(s)) {
    return s as ResumePreferredLanguage
  }

  const aliases: Record<string, ResumePreferredLanguage> = {
    ptbr: "pt_br",
    pt_br_br: "pt_br",
    pt_brazil: "pt_br",
    brazilian_portuguese: "pt_br",
    es_es: "es",
    es_mx: "es",
    spanish: "es",
    english: "en",
    en_us: "en",
    en_gb: "en",
  }
  return aliases[s] ?? DEFAULT_RESUME_PREFERRED_LANGUAGE
}
