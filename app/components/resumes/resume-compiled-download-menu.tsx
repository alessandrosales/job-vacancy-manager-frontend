"use client"

import * as React from "react"
import { ChevronDownIcon, DownloadIcon, FileTextIcon, Loader2Icon } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { ApiError } from "~/lib/api/errors"
import {
  downloadResumeCompiledExport,
  type ResumeCompiledExportFormat,
} from "~/lib/api/resources/resumes"

function exportErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const base = err.fieldErrors.base?.[0]
    if (base) return base
    const first = Object.values(err.fieldErrors).flat()[0]
    if (first) return first
  }
  if (err instanceof Error && err.message) return err.message
  return "Could not download export."
}

export interface ResumeCompiledDownloadMenuProps {
  resumeId: string
  resumeTitle: string
  compiledMarkdown: string | null | undefined
}

export function ResumeCompiledDownloadMenu({
  resumeId,
  resumeTitle,
  compiledMarkdown,
}: ResumeCompiledDownloadMenuProps) {
  const [busy, setBusy] = React.useState<ResumeCompiledExportFormat | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  if (!compiledMarkdown?.trim()) {
    return null
  }

  const runDownload = async (format: ResumeCompiledExportFormat) => {
    setError(null)
    setBusy(format)
    try {
      await downloadResumeCompiledExport(resumeId, format)
    } catch (e) {
      setError(exportErrorMessage(e))
    } finally {
      setBusy(null)
    }
  }

  const triggerLabel = busy ? "Downloading…" : "Download"

  return (
    <div className="flex flex-col items-stretch gap-1">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy !== null}
            aria-label={`Download compiled CV for ${resumeTitle}`}
          >
            {busy !== null ? (
              <Loader2Icon data-icon="inline-start" className="animate-spin" />
            ) : (
              <DownloadIcon data-icon="inline-start" />
            )}
            {triggerLabel}
            <ChevronDownIcon data-icon="inline-end" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[12rem]">
          <DropdownMenuGroup aria-label="Export formats">
            <DropdownMenuItem
              disabled={busy !== null}
              onSelect={(ev) => {
                ev.preventDefault()
                void runDownload("md")
              }}
            >
              <FileTextIcon data-icon="inline-start" />
              Markdown (.md)
              {busy === "md" ? (
                <Loader2Icon className="ml-auto animate-spin" aria-hidden />
              ) : null}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={busy !== null}
              onSelect={(ev) => {
                ev.preventDefault()
                void runDownload("docx")
              }}
            >
              <FileTextIcon data-icon="inline-start" />
              Word (.docx)
              {busy === "docx" ? (
                <Loader2Icon className="ml-auto animate-spin" aria-hidden />
              ) : null}
            </DropdownMenuItem>
            <DropdownMenuItem
              disabled={busy !== null}
              onSelect={(ev) => {
                ev.preventDefault()
                void runDownload("pdf")
              }}
            >
              <FileTextIcon data-icon="inline-start" />
              PDF (.pdf)
              {busy === "pdf" ? (
                <Loader2Icon className="ml-auto animate-spin" aria-hidden />
              ) : null}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {error ? (
        <p className="text-destructive max-w-[14rem] text-xs leading-snug" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
