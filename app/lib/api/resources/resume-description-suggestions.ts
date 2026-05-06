import { apiRequestJson } from "~/lib/api/client"
import type { ResumePreferredLanguage } from "~/lib/resume-preferred-language"

/** Payload alinhado ao `POST /api/v1/resumes/description-suggestions` (snake_case). */
export type ResumeDescriptionSuggestionPayload = {
  title: string
  role_name: string | null
  /** Idioma do formulário (`en`, `pt_br`, `es`) — o modelo deve responder nesse idioma. */
  preferred_language: ResumePreferredLanguage
  work_experience_summaries: string[]
  certification_names: string[]
  education_summaries: string[]
  skill_names: string[]
  previous_description: string
}

export async function createResumeDescriptionSuggestion(
  payload: ResumeDescriptionSuggestionPayload
): Promise<string> {
  const data = await apiRequestJson<{ description: string }>({
    path: "resumes/description-suggestions",
    method: "POST",
    body: payload,
  })
  return data.description
}
