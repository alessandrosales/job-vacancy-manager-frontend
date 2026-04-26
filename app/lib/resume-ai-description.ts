/**
 * Context for drafting a resume description (used by the AI assistant dialog).
 * No network call — keeps the layout usable without API keys.
 */
export type ResumeDescriptionAiContext = {
  title: string
  roleName: string | null
  workExperienceSummaries: readonly string[]
  certificationNames: readonly string[]
  educationSummaries: readonly string[]
  skillNames: readonly string[]
  /** Current description text when the user opened "Generate". */
  previousDescription: string
}

/**
 * Simulates an AI pass: short delay, then a structured draft from title, role,
 * linked records, and the previous description as source notes.
 */
export async function generateResumeDescriptionWithAi(
  ctx: ResumeDescriptionAiContext
): Promise<string> {
  await new Promise((r) => setTimeout(r, 700))

  const head = ctx.title.trim() || "Professional profile"
  const blocks: string[] = []

  blocks.push(
    `${head} — summary drafted for your tracker. Use it as a starting point and edit freely.`
  )

  if (ctx.roleName) {
    blocks.push(
      `Target role: ${ctx.roleName}. Highlight impact, ownership, and collaboration relevant to this position.`
    )
  }

  if (ctx.workExperienceSummaries.length > 0) {
    const list = ctx.workExperienceSummaries.slice(0, 8).join("\n• ")
    blocks.push(`Selected experience:\n• ${list}`)
  }

  if (ctx.certificationNames.length > 0) {
    blocks.push(`Certifications: ${ctx.certificationNames.slice(0, 12).join(", ")}.`)
  }

  if (ctx.educationSummaries.length > 0) {
    blocks.push(`Education: ${ctx.educationSummaries.slice(0, 6).join(" | ")}.`)
  }

  if (ctx.skillNames.length > 0) {
    blocks.push(`Key skills: ${ctx.skillNames.slice(0, 24).join(", ")}.`)
  }

  const prev = ctx.previousDescription.trim()
  if (prev) {
    blocks.push(`\n---\nYour previous notes (merged into this draft):\n${prev}`)
  }

  return blocks.join("\n\n")
}
