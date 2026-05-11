"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
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
import {
  importResumeFromPdf,
  type ApiResume,
} from "~/lib/api/resources/resumes"
import {
  RESUME_PREFERRED_LANGUAGE_OPTIONS,
  defaultResumePreferredLanguageForUser,
  type ResumePreferredLanguage,
} from "~/lib/resume-preferred-language"
import { cn } from "~/lib/utils"
import { useSessionUserStore } from "~/stores/session-user-store"
import { pagesI18nNs } from "~/lib/i18n/config"

const PDF_ACCEPT = ".pdf,application/pdf"

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
          className="pointer-events-none absolute inset-[-22%] rounded-full bg-[conic-gradient(from_200deg,var(--neon-cyan),var(--neon-magenta),var(--neon-violet),var(--neon-cyan))] opacity-[0.14] blur-2xl motion-safe:animate-[pdf-import-halo_3.2s_ease-in-out_infinite] dark:opacity-[0.26]"
          style={{
            ["--neon-cyan" as string]: "rgb(34 211 238)",
            ["--neon-magenta" as string]: "rgb(232 121 249)",
            ["--neon-violet" as string]: "rgb(167 139 250)",
          }}
        />
        <div className="pointer-events-none absolute inset-[6%] rounded-full bg-primary/10 blur-xl motion-safe:animate-pulse dark:bg-fuchsia-500/10" />

        {/* Trilho + arco espesso (rotação normal) */}
        <svg
          className="absolute inset-0 size-full overflow-visible text-[0] motion-safe:animate-[spin_1.55s_linear_infinite] motion-reduce:animate-none"
          viewBox="0 0 100 100"
          aria-hidden
        >
          <defs>
            <linearGradient
              id={gradPrimary}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              {/* Saturação média: legível no light mode; ainda vibrante no dark */}
              <stop offset="0%" stopColor="#0891b2" />
              <stop offset="45%" stopColor="#c026d3" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
            <filter
              id={filterGlow}
              x="-55%"
              y="-55%"
              width="210%"
              height="210%"
            >
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
            className="stroke-muted-foreground/35 dark:stroke-muted-foreground/20"
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
            className="drop-shadow-[0_0_8px_rgba(124,58,237,0.35)] dark:drop-shadow-[0_0_12px_rgba(232,121,249,0.45)]"
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
              <stop offset="0%" stopColor="#c026d3" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0.45" />
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
            className="opacity-90 drop-shadow-[0_0_6px_rgba(192,38,211,0.35)] dark:opacity-80 dark:drop-shadow-[0_0_8px_rgba(240,171,252,0.55)]"
          />
        </svg>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            key={statusText}
            className="animate-in rounded-full bg-muted/80 p-2.5 shadow-sm ring-1 ring-border backdrop-blur-sm duration-300 zoom-in-95 fade-in dark:bg-background/45 dark:shadow-[0_0_28px_rgba(34,211,238,0.22),0_0_42px_rgba(232,121,249,0.12)] dark:ring-cyan-400/45"
          >
            <StageIcon
              className="size-8 text-primary dark:text-cyan-100 dark:drop-shadow-[0_0_12px_rgba(34,211,238,0.65)]"
              strokeWidth={1.75}
              aria-hidden
            />
          </div>
        </div>
      </div>

      <div className="flex max-w-xs flex-col gap-1 text-center">
        <p
          key={statusText}
          className="animate-in text-sm font-medium tracking-tight text-foreground duration-300 fade-in slide-in-from-bottom-1 dark:text-cyan-100 dark:drop-shadow-[0_0_12px_rgba(34,211,238,0.35)]"
        >
          {statusText}
        </p>
        {fileName ? (
          <p className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground/80">{fileName}</span>
          </p>
        ) : null}
      </div>

      <style>{`
        @keyframes pdf-import-halo {
          0%,
          100% {
            opacity: 0.12;
            transform: scale(0.96);
          }
          50% {
            opacity: 0.22;
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
  const { t } = useTranslation(pagesI18nNs)
  const pdfImportStages = React.useMemo<
    ReadonlyArray<{ label: string; Icon: LucideIcon }>
  >(
    () => [
      { label: t("resume.pdf_import.stage_sending"), Icon: UploadCloud },
      { label: t("resume.pdf_import.stage_reading"), Icon: FileText },
      { label: t("resume.pdf_import.stage_companies"), Icon: Building2 },
      { label: t("resume.pdf_import.stage_roles"), Icon: BadgeCheck },
      { label: t("resume.pdf_import.stage_skills"), Icon: Sparkles },
      { label: t("resume.pdf_import.stage_languages"), Icon: Languages },
      { label: t("resume.pdf_import.stage_work"), Icon: History },
      { label: t("resume.pdf_import.stage_education"), Icon: GraduationCap },
      { label: t("resume.pdf_import.stage_certifications"), Icon: Award },
      { label: t("resume.pdf_import.stage_links"), Icon: Link2 },
    ],
    [t]
  )

  const inputRef = React.useRef<HTMLInputElement>(null)
  const [roleId, setRoleId] = React.useState("")
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [rejectMessage, setRejectMessage] = React.useState<string | null>(null)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [submitting, setSubmitting] = React.useState(false)
  const [pdfImportStageIndex, setPdfImportStageIndex] = React.useState(0)
  const [preferredLanguage, setPreferredLanguage] =
    React.useState<ResumePreferredLanguage>(() =>
      defaultResumePreferredLanguageForUser(
        useSessionUserStore.getState().user.preferred_language
      )
    )

  React.useEffect(() => {
    if (!open) return
    setSelectedFile(null)
    setRejectMessage(null)
    setSubmitError(null)
    setIsDragging(false)
    setSubmitting(false)
    setPdfImportStageIndex(0)
    setRoleId("")
    setPreferredLanguage(
      defaultResumePreferredLanguageForUser(
        useSessionUserStore.getState().user.preferred_language
      )
    )
    if (inputRef.current) inputRef.current.value = ""
  }, [open])

  React.useEffect(() => {
    if (!submitting) return
    setPdfImportStageIndex(0)
    const id = window.setInterval(() => {
      setPdfImportStageIndex((i) => (i + 1) % pdfImportStages.length)
    }, PDF_IMPORT_STAGE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [submitting, pdfImportStages.length])

  React.useEffect(() => {
    if (!open) return
    if (roles.length === 1) setRoleId(roles[0].id)
  }, [open, roles])

  function applyFile(file: File) {
    if (!isPdfFile(file)) {
      setRejectMessage(t("resume.pdf_import.reject_not_pdf"))
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
        preferred_language: preferredLanguage,
      })
      await onImported(resume)
      onOpenChange(false)
    } catch (err) {
      setSubmitError(
        pdfImportErrorText(err, t("resume.pdf_import.error_fallback"))
      )
    } finally {
      setSubmitting(false)
    }
  }

  const hasRoles = roles.length > 0
  const canImport = Boolean(
    selectedFile && roleId.trim() && hasRoles && !submitting
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("resume.pdf_import.title")}</DialogTitle>
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
            <FieldLabel htmlFor="resume-import-preferred-lang">
              {t("resume.field_preferred_language")}
            </FieldLabel>
            <Select
              value={preferredLanguage}
              onValueChange={(v) =>
                setPreferredLanguage(v as ResumePreferredLanguage)
              }
              disabled={submitting}
            >
              <SelectTrigger
                id="resume-import-preferred-lang"
                className="w-full"
              >
                <SelectValue
                  placeholder={t("resume.placeholder_preferred_language")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {RESUME_PREFERRED_LANGUAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FieldDescription>
              {t("resume.pdf_import.preferred_lang_hint")}
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="resume-import-role">
              {t("shared.role")}
            </FieldLabel>
            {hasRoles ? (
              <Select
                value={roleId === "" ? undefined : roleId}
                onValueChange={setRoleId}
                disabled={submitting}
              >
                <SelectTrigger id="resume-import-role" className="w-full">
                  <SelectValue
                    placeholder={t("resume.pdf_import.role_placeholder")}
                  />
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
              <p className="text-sm text-muted-foreground">
                {t("resume.pdf_import.no_roles_before")}{" "}
                <Link
                  to="/roles/role"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {t("resume.pdf_import.no_roles_link")}
                </Link>{" "}
                {t("resume.pdf_import.no_roles_after")}
              </p>
            )}
            <FieldDescription>
              {t("resume.pdf_import.role_attached_hint")}
            </FieldDescription>
          </Field>

          <div className="flex flex-col gap-2">
            <FieldLabel className="text-foreground">
              {t("resume.pdf_import.pdf_file_label")}
            </FieldLabel>
            <FieldDescription
              id="resume-import-linkedin-hint"
              className="text-pretty"
            >
              {t("resume.pdf_import.linkedin_hint")}
            </FieldDescription>
            <div
              role="button"
              tabIndex={submitting ? -1 : 0}
              aria-label={t("resume.pdf_import.drop_zone_aria")}
              aria-describedby="resume-import-linkedin-hint"
              aria-disabled={submitting}
              className={cn(
                "flex min-h-[11rem] flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-muted-foreground/35 bg-muted/25 px-4 py-8 text-center text-muted-foreground transition-colors outline-none",
                submitting &&
                  "relative overflow-visible border-primary/45 bg-muted/50 shadow-sm dark:border-cyan-500/40 dark:bg-[radial-gradient(ellipse_85%_70%_at_50%_42%,rgba(232,121,249,0.09),transparent_72%),radial-gradient(ellipse_90%_55%_at_50%_38%,rgba(34,211,238,0.06),transparent_70%)] dark:shadow-[0_0_32px_-12px_rgba(34,211,238,0.35)]",
                !submitting &&
                  "cursor-pointer hover:border-muted-foreground/55 hover:bg-muted/35",
                !submitting &&
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                submitting && "cursor-wait opacity-100",
                isDragging &&
                  !submitting &&
                  "border-primary/60 bg-primary/5 text-foreground"
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
                  stage={pdfImportStages[pdfImportStageIndex]!}
                  fileName={selectedFile?.name}
                />
              ) : (
                <>
                  <FileUpIcon className="size-10 shrink-0 opacity-70" />
                  <div className="flex max-w-xs flex-col gap-1">
                    <p className="text-sm font-medium text-foreground">
                      {t("resume.pdf_import.drop_main")}
                    </p>
                    <p className="text-xs leading-relaxed">
                      {t("resume.pdf_import.drop_sub")}
                    </p>
                  </div>
                </>
              )}
            </div>
            {rejectMessage ? (
              <p className="text-sm text-destructive" role="alert">
                {rejectMessage}
              </p>
            ) : null}
            {!submitting && selectedFile ? (
              <p className="text-sm text-muted-foreground">
                {t("resume.pdf_import.selected_prefix")}{" "}
                <span className="font-medium text-foreground">
                  {selectedFile.name}
                </span>
              </p>
            ) : null}
          </div>

          {submitError ? (
            <p className="text-sm text-destructive" role="alert">
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
            {t("shared.close")}
          </Button>
          <Button
            type="button"
            disabled={!canImport}
            onClick={() => void handleImport()}
          >
            {submitting ? (
              <>
                <Loader2Icon
                  className="size-4 animate-spin"
                  data-icon="inline-start"
                />
                {t("resume.pdf_import.importing")}
              </>
            ) : (
              t("resume.pdf_import.import")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
