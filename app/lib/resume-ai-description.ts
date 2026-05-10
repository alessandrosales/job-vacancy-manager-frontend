import { ApiError } from "~/lib/api/errors"
import { createResumeDescriptionSuggestion } from "~/lib/api/resources/resume-description-suggestions"
import type { ResumePreferredLanguage } from "~/lib/resume-preferred-language"

/**
 * Context for drafting a resume description (used by the AI assistant dialog).
 * Variáveis locais no formulário podem usar camelCase; o payload da API usa snake_case.
 */
export type ResumeDescriptionAiContext = {
  title: string
  roleName: string | null
  /** Idioma selecionado no currículo — a API instrui o modelo a escrever nesse idioma. */
  preferredLanguage: ResumePreferredLanguage
  workExperienceSummaries: readonly string[]
  certificationNames: readonly string[]
  educationSummaries: readonly string[]
  skillNames: readonly string[]
  /** Current description text when the user ran Generate (or the dialog preview). */
  previousDescription: string
}

function suggestionErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const base = err.fieldErrors.base?.[0]
    if (base) return base
    const titleErr = err.fieldErrors.title?.[0]
    if (titleErr) return titleErr
    const first = Object.values(err.fieldErrors).flat()[0]
    if (first) return first
  }
  return fallback
}

/**
 * Chama o backend (RubyLLM) para gerar um rascunho de descrição a partir do título, cargo
 * e registros vinculados.
 */
export async function generateResumeDescriptionWithAi(
  ctx: ResumeDescriptionAiContext
): Promise<string> {
  try {
    return await createResumeDescriptionSuggestion({
      title: ctx.title,
      role_name: ctx.roleName,
      preferred_language: ctx.preferredLanguage,
      work_experience_summaries: [...ctx.workExperienceSummaries],
      certification_names: [...ctx.certificationNames],
      education_summaries: [...ctx.educationSummaries],
      skill_names: [...ctx.skillNames],
      previous_description: ctx.previousDescription,
    })
  } catch (err) {
    throw new Error(
      suggestionErrorMessage(err, "Could not generate a description.")
    )
  }
}
