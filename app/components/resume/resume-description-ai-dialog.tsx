"use client"

import * as React from "react"

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
      setGenerateError(e instanceof Error ? e.message : "Could not generate a description.")
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
            <DialogTitle>AI description assistant</DialogTitle>
            <DialogDescription>
              Generate improves the preview text using your resume language, linked role, and linked
              profile data as context—keep editing the preview, then Apply to copy it into your resume
              description.
            </DialogDescription>
          </DialogHeader>
          {generateError ? (
            <p className="text-destructive text-sm" role="alert">
              {generateError}
            </p>
          ) : null}
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="resume-ai-draft">Preview</FieldLabel>
              <Textarea
                id="resume-ai-draft"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="min-h-48 resize-y"
                placeholder="Current description loads here. Generate replaces this text."
                disabled={isGenerating}
              />
              <FieldDescription className="pb-4">
                You can edit the preview before applying.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </div>
        <DialogFooter className="mx-0 mb-0 mt-0 shrink-0 gap-2 rounded-b-xl border-t bg-muted/30 px-4 py-3 sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={isGenerating}
            onClick={() => void handleGenerate()}
          >
            {isGenerating ? (
              <Loader2Icon className="animate-spin" data-icon="inline-start" aria-hidden />
            ) : (
              <SparklesIcon data-icon="inline-start" aria-hidden />
            )}
            Generate
          </Button>
          <Button type="button" onClick={handleApply} disabled={isGenerating}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
