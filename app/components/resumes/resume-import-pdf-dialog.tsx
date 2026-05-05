"use client"

import * as React from "react"
import { Link } from "react-router"
import type { LucideIcon } from "lucide-react"
import {
  Award,
  BadgeCheck,
  Building2,
  FileText,
  FileUpIcon,
  GraduationCap,
  History,
  Languages,
  Link2,
  Loader2Icon,
  Sparkles,
  UploadCloud,
} from "lucide-react"

import type { Role } from "~/components/providers/app-data-provider"
import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { ApiError } from "~/lib/api/errors"
import { importResumeFromPdf, type ApiResume } from "~/lib/api/resources/resumes"
import { cn } from "~/lib/utils"

const PDF_ACCEPT = ".pdf,application/pdf"

/** Estágios exibidos em ciclo durante o import (somente UX; não reflete timestamps reais da API). */
const PDF_IMPORT_STAGES: ReadonlyArray<{ label: string; Icon: LucideIcon }> = [
  { label: "Sending your PDF…", Icon: UploadCloud },
  { label: "Reading document text…", Icon: FileText },
  { label: "Extracting companies…", Icon: Building2 },
  { label: "Extracting roles…", Icon: BadgeCheck },
  { label: "Extracting skills…", Icon: Sparkles },
  { label: "Extracting languages…", Icon: Languages },
  { label: "Extracting work experience…", Icon: History },
  { label: "Extracting education…", Icon: GraduationCap },
  { label: "Extracting certifications…", Icon: Award },
  { label: "Extracting profile links…", Icon: Link2 },
]

const PDF_IMPORT_STAGE_INTERVAL_MS = 1900

function isPdfFile(file: File): boolean {
  if (file.type === "application/pdf") return true
  return file.name.toLowerCase().endsWith(".pdf")
}

function PdfImportNeonUploadRing({
  stage,
  fileName,
}: {
  stage: { label: string; Icon: LucideIcon }
  fileName?: string
}) {
  const uid = React.useId().replace(/:/g, "")
  const gradPrimary = `neon-primary-${uid}`
  const gradTrail = `neon-trail-${uid}`
  const filterGlow = `neon-filter-${uid}`
  const { label: statusText, Icon: StageIcon } = stage

  return (
    <div
      className="relative flex flex-col items-center justify-center gap-5 overflow-visible py-2"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <p className="sr-only">{statusText}</p>
      <div className="relative flex size-[8rem] items-center justify-center overflow-visible">
        <div
          className="pointer-events-none absolute inset-[-22%] motion-safe:animate-[pdf-import-halo_3.2s_ease-in-out_infinite] rounded-full bg-[conic-gradient(from_200deg,var(--neon-cyan),var(--neon-magenta),var(--neon-violet),var(--neon-cyan))] opacity-[0.26] blur-2xl"
          style={{
            ["--neon-cyan" as string]: "rgb(34 211 238)",
            ["--neon-magenta" as string]: "rgb(232 121 249)",
            ["--neon-violet" as string]: "rgb(167 139 250)",
          }}
        />
        <div className="pointer-events-none absolute inset-[6%] rounded-full bg-fuchsia-500/10 blur-xl motion-safe:animate-pulse" />

        {/* Trilho + arco espesso (rotação normal) */}
        <svg
          className="absolute inset-0 size-full overflow-visible text-[0] motion-safe:animate-[spin_1.55s_linear_infinite] motion-reduce:animate-none"
          viewBox="0 0 100 100"
          aria-hidden
        >
          <defs>
            <linearGradient id={gradPrimary} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="45%" stopColor="#e879f9" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
            <filter id={filterGlow} x="-55%" y="-55%" width="210%" height="210%">
              <feGaussianBlur stdDeviation="2.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            className="stroke-muted-foreground/20"
            strokeWidth="4.5"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={`url(#${gradPrimary})`}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="95 156"
            filter={`url(#${filterGlow})`}
            className="drop-shadow-[0_0_12px_rgba(232,121,249,0.45)]"
          />
        </svg>

        {/* Segundo arco mais fino, sentido contrário — “cometa” neon */}
        <svg
          className="absolute inset-0 size-full overflow-visible text-[0] motion-safe:animate-[spin_0.95s_linear_infinite_reverse] motion-reduce:animate-none"
          viewBox="0 0 100 100"
          aria-hidden
        >
          <defs>
            <linearGradient id={gradTrail} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#f0abfc" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.35" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="36"
            fill="none"
            stroke={`url(#${gradTrail})`}
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeDasharray="48 178"
            className="opacity-80 drop-shadow-[0_0_8px_rgba(240,171,252,0.65)]"
          />
        </svg>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            key={statusText}
            className="rounded-full bg-background/45 p-2.5 shadow-[0_0_28px_rgba(34,211,238,0.22),0_0_42px_rgba(232,121,249,0.12),inset_0_0_22px_rgba(232,121,249,0.1)] ring-1 ring-cyan-400/45 backdrop-blur-sm duration-300 animate-in fade-in zoom-in-95"
          >
            <StageIcon
              className="size-8 text-cyan-100 drop-shadow-[0_0_14px_rgba(34,211,238,0.85),0_0_10px_rgba(232,121,249,0.35)]"
              strokeWidth={1.75}
              aria-hidden
            />
          </div>
        </div>
      </div>

      <div className="flex max-w-xs flex-col gap-1 text-center">
        <p
          key={statusText}
          className="text-sm font-medium tracking-tight text-cyan-100 drop-shadow-[0_0_12px_rgba(34,211,238,0.35)] duration-300 animate-in fade-in slide-in-from-bottom-1"
        >
          {statusText}
        </p>
        {fileName ? (
          <p className="text-muted-foreground text-xs leading-relaxed">
            <span className="text-foreground/80 font-medium">{fileName}</span>
          </p>
        ) : null}
      </div>

      <style>{`
        @keyframes pdf-import-halo {
          0%,
          100% {
            opacity: 0.18;
            transform: scale(0.96);
          }
          50% {
            opacity: 0.32;
            transform: scale(1.04);
          }
        }
      `}</style>
    </div>
  )
}

function pdfImportErrorText(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const base = err.fieldErrors.base?.[0]
    if (base) return base
    const fileErr = err.fieldErrors.file?.[0]
    if (fileErr) return fileErr
    const roleErr = err.fieldErrors.role_id?.[0]
    if (roleErr) return roleErr
    const first = Object.values(err.fieldErrors).flat()[0]
    if (first) return first
  }
  return fallback
}

export function ResumeImportPdfDialog({
  open,
  onOpenChange,
  roles,
  onImported,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  roles: readonly Role[]
  onImported: (resume: ApiResume) => void | Promise<void>
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [roleId, setRoleId] = React.useState("")
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [rejectMessage, setRejectMessage] = React.useState<string | null>(null)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [pdfImportStageIndex, setPdfImportStageIndex] = React.useState(0)

  React.useEffect(() => {
    if (!open) return
    setSelectedFile(null)
    setRejectMessage(null)
    setSubmitError(null)
    setIsDragging(false)
    setSubmitting(false)
    setPdfImportStageIndex(0)
    setRoleId("")
    if (inputRef.current) inputRef.current.value = ""
  }, [open])

  React.useEffect(() => {
    if (!submitting) return
    setPdfImportStageIndex(0)
    const id = window.setInterval(() => {
      setPdfImportStageIndex((i) => (i + 1) % PDF_IMPORT_STAGES.length)
    }, PDF_IMPORT_STAGE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [submitting])

  React.useEffect(() => {
    if (!open) return
    if (roles.length === 1) setRoleId(roles[0].id)
  }, [open, roles])

  function applyFile(file: File) {
    if (!isPdfFile(file)) {
      setRejectMessage("Please use a PDF file.")
      return
    }
    setRejectMessage(null)
    setSelectedFile(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (file) applyFile(file)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (submitting) return
    const file = e.dataTransfer.files?.[0]
    if (file) applyFile(file)
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    e.stopPropagation()
  }

  function handleDragEnter(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    if (!submitting) setIsDragging(true)
  }

  function handleDragLeave(e: React.DragEvent<HTMLDivElement>) {
    const next = e.relatedTarget as Node | null
    if (next && e.currentTarget.contains(next)) return
    setIsDragging(false)
  }

  function openFilePicker() {
    if (submitting) return
    setRejectMessage(null)
    inputRef.current?.click()
  }

  async function handleImport() {
    if (!selectedFile || !roleId.trim()) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      const resume = await importResumeFromPdf({
        file: selectedFile,
        role_id: roleId.trim(),
      })
      await onImported(resume)
      onOpenChange(false)
    } catch (err) {
      setSubmitError(pdfImportErrorText(err, "Could not import the PDF."))
    } finally {
      setSubmitting(false)
    }
  }

  const hasRoles = roles.length > 0
  const canImport = Boolean(selectedFile && roleId.trim() && hasRoles && !submitting)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import resume from PDF</DialogTitle>
        </DialogHeader>
        <input
          ref={inputRef}
          type="file"
          accept={PDF_ACCEPT}
          className="sr-only"
          tabIndex={-1}
          onChange={handleInputChange}
        />
        <FieldGroup className="gap-4">
          <Field>
            <FieldLabel htmlFor="resume-import-role">Role</FieldLabel>
            {hasRoles ? (
              <Select
                value={roleId === "" ? undefined : roleId}
                onValueChange={setRoleId}
                disabled={submitting}
              >
                <SelectTrigger id="resume-import-role" className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {roles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-muted-foreground text-sm">
                No roles yet.{" "}
                <Link to="/roles/role" className="text-primary underline-offset-4 hover:underline">
                  Create a role
                </Link>{" "}
                first, then try importing again.
              </p>
            )}
            <FieldDescription>
              Imported content is attached to this role, like a manually created resume.
            </FieldDescription>
          </Field>

          <div className="flex flex-col gap-2">
            <FieldLabel className="text-foreground">PDF file</FieldLabel>
            <div
              role="button"
              tabIndex={submitting ? -1 : 0}
              aria-label="Choose PDF file or drop a PDF here"
              aria-disabled={submitting}
              className={cn(
                "border-muted-foreground/35 bg-muted/25 text-muted-foreground flex min-h-[11rem] flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-4 py-8 text-center outline-none transition-colors",
                submitting &&
                  "relative overflow-visible border-cyan-500/40 shadow-[0_0_32px_-12px_rgba(34,211,238,0.35)] bg-[radial-gradient(ellipse_85%_70%_at_50%_42%,rgba(232,121,249,0.09),transparent_72%),radial-gradient(ellipse_90%_55%_at_50%_38%,rgba(34,211,238,0.06),transparent_70%)]",
                !submitting &&
                  "hover:border-muted-foreground/55 hover:bg-muted/35 cursor-pointer",
                !submitting &&
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                submitting && "cursor-wait opacity-100",
                isDragging && !submitting && "border-primary/60 bg-primary/5 text-foreground"
              )}
              onClick={openFilePicker}
              onKeyDown={(e) => {
                if (submitting) return
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  openFilePicker()
                }
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
            >
              {submitting ? (
                <PdfImportNeonUploadRing
                  stage={PDF_IMPORT_STAGES[pdfImportStageIndex]!}
                  fileName={selectedFile?.name}
                />
              ) : (
                <>
                  <FileUpIcon className="size-10 shrink-0 opacity-70" />
                  <div className="flex max-w-xs flex-col gap-1">
                    <p className="text-sm font-medium text-foreground">
                      Drag and drop a PDF here
                    </p>
                    <p className="text-xs leading-relaxed">Or click to browse your files.</p>
                  </div>
                </>
              )}
            </div>
            {rejectMessage ? (
              <p className="text-destructive text-sm" role="alert">
                {rejectMessage}
              </p>
            ) : null}
            {!submitting && selectedFile ? (
              <p className="text-muted-foreground text-sm">
                Selected:{" "}
                <span className="text-foreground font-medium">{selectedFile.name}</span>
              </p>
            ) : null}
          </div>

          {submitError ? (
            <p className="text-destructive text-sm" role="alert">
              {submitError}
            </p>
          ) : null}
        </FieldGroup>
        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Close
          </Button>
          <Button type="button" disabled={!canImport} onClick={() => void handleImport()}>
            {submitting ? (
              <>
                <Loader2Icon className="size-4 animate-spin" data-icon="inline-start" />
                Importing…
              </>
            ) : (
              "Import"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
