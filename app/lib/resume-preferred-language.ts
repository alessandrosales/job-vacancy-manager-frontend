/** Alinhado ao backend: `Resume::PREFERRED_LANGUAGES` e `db.mermaid` (resumes). */
export const RESUME_PREFERRED_LANGUAGE_CODES = ["en", "pt_br", "es"] as const

export type ResumePreferredLanguage = (typeof RESUME_PREFERRED_LANGUAGE_CODES)[number]

export const DEFAULT_RESUME_PREFERRED_LANGUAGE: ResumePreferredLanguage = "en"

export const RESUME_PREFERRED_LANGUAGE_OPTIONS: ReadonlyArray<{
  value: ResumePreferredLanguage
  label: string
}> = [
  { value: "en", label: "English" },
  { value: "pt_br", label: "Português (Brasil)" },
  { value: "es", label: "Español" },
]

export function normalizeResumePreferredLanguage(raw: unknown): ResumePreferredLanguage {
  const s = typeof raw === "string" ? raw.trim() : ""
  return (RESUME_PREFERRED_LANGUAGE_CODES as readonly string[]).includes(s)
    ? (s as ResumePreferredLanguage)
    : DEFAULT_RESUME_PREFERRED_LANGUAGE
}
