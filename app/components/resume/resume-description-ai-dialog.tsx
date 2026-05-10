"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"

import {
  generateResumeDescriptionWithAi,
  type ResumeDescriptionAiContext,
} from "~/lib/resume-ai-description"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Textarea } from "~/components/ui/textarea"
import { Loader2Icon, SparklesIcon } from "lucide-react"
import { pagesI18nNs } from "~/lib/i18n/config"

export function ResumeDescriptionAiDialog({
  open,
  onOpenChange,
  initialDescription,
  context,
  onApply,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialDescription: string
  context: ResumeDescriptionAiContext
  onApply: (text: string) => void
}) {
  const { t } = useTranslation(pagesI18nNs)
  const [draft, setDraft] = React.useState(initialDescription)
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [generateError, setGenerateError] = React.useState<string | null>(null)
  const wasOpenRef = React.useRef(false)

  React.useEffect(() => {
    if (open && !wasOpenRef.current) {
      setDraft(initialDescription)
      setGenerateError(null)
    }
    wasOpenRef.current = open
  }, [open, initialDescription])

  async function handleGenerate() {
    setGenerateError(null)
    setIsGenerating(true)
    try {
      const next = await generateResumeDescriptionWithAi({
        ...context,
        previousDescription: draft,
      })
      setDraft(next)
    } catch (e) {
      setGenerateError(
        e instanceof Error
          ? e.message
          : t("resume.ai_description.error_fallback")
      )
    } finally {
      setIsGenerating(false)
    }
  }

  function handleApply() {
    onApply(draft.trim())
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="flex max-h-[min(90vh,640px)] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <div className="flex flex-col gap-4 p-4 pb-0">
          <DialogHeader>
            <DialogTitle>{t("resume.ai_description.title")}</DialogTitle>
            <DialogDescription>
              {t("resume.ai_description.description")}
            </DialogDescription>
          </DialogHeader>
          {generateError ? (
            <p className="text-sm text-destructive" role="alert">
              {generateError}
            </p>
          ) : null}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="resume-ai-draft">
                {t("resume.ai_description.preview_label")}
              </FieldLabel>
              <Textarea
                id="resume-ai-draft"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="min-h-48 resize-y"
                placeholder={t("resume.ai_description.draft_placeholder")}
                disabled={isGenerating}
              />
              <FieldDescription className="pb-4">
                {t("resume.ai_description.preview_hint")}
              </FieldDescription>
            </Field>
          </FieldGroup>
        </div>
        <DialogFooter className="mx-0 mt-0 mb-0 shrink-0 gap-2 rounded-b-xl border-t bg-muted/30 px-4 py-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t("shared.cancel")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={isGenerating}
            onClick={() => void handleGenerate()}
          >
            {isGenerating ? (
              <Loader2Icon
                className="animate-spin"
                data-icon="inline-start"
                aria-hidden
              />
            ) : (
              <SparklesIcon data-icon="inline-start" aria-hidden />
            )}
            {isGenerating
              ? t("resume.ai_description.generating")
              : t("resume.ai_description.generate")}
          </Button>
          <Button type="button" onClick={handleApply} disabled={isGenerating}>
            {t("resume.ai_description.apply")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
