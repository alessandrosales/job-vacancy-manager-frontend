"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import type { LucideIcon } from "lucide-react"
import {
  Award,
  BrainCircuit,
  FileCode2,
  FileText,
  GraduationCap,
  Loader2Icon,
  Sparkles,
  History,
} from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "~/components/ui/dialog"
import { ApiError } from "~/lib/api/errors"
import { compileResumeMarkdown, type ApiResume } from "~/lib/api/resources/resumes"
import { pagesI18nNs } from "~/lib/i18n/config"

const COMPILE_STAGE_INTERVAL_MS = 1800

function CompileNeonRing({
  stage,
}: {
  stage: { label: string; Icon: LucideIcon }
}) {
  const uid = React.useId().replace(/:/g, "")
  const gradPrimary = `compile-primary-${uid}`
  const gradTrail = `compile-trail-${uid}`
  const filterGlow = `compile-filter-${uid}`
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
          className="pointer-events-none absolute inset-[-22%] motion-safe:animate-[compile-halo_3.2s_ease-in-out_infinite] rounded-full bg-[conic-gradient(from_200deg,var(--neon-emerald),var(--neon-cyan),var(--neon-violet),var(--neon-emerald))] opacity-[0.14] blur-2xl dark:opacity-[0.26]"
          style={{
            ["--neon-emerald" as string]: "rgb(52 211 153)",
            ["--neon-cyan" as string]: "rgb(34 211 238)",
            ["--neon-violet" as string]: "rgb(167 139 250)",
          }}
        />
        <div className="pointer-events-none absolute inset-[6%] rounded-full bg-primary/10 blur-xl motion-safe:animate-pulse dark:bg-emerald-500/10" />

        <svg
          className="absolute inset-0 size-full overflow-visible text-[0] motion-safe:animate-[spin_1.55s_linear_infinite] motion-reduce:animate-none"
          viewBox="0 0 100 100"
          aria-hidden
        >
          <defs>
            <linearGradient id={gradPrimary} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="45%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#7c3aed" />
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
            className="drop-shadow-[0_0_8px_rgba(5,150,105,0.35)] dark:drop-shadow-[0_0_12px_rgba(52,211,153,0.45)]"
          />
        </svg>

        <svg
          className="absolute inset-0 size-full overflow-visible text-[0] motion-safe:animate-[spin_0.95s_linear_infinite_reverse] motion-reduce:animate-none"
          viewBox="0 0 100 100"
          aria-hidden
        >
          <defs>
            <linearGradient id={gradTrail} x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0891b2" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#059669" stopOpacity="0.45" />
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
            className="opacity-90 drop-shadow-[0_0_6px_rgba(5,150,105,0.35)] dark:opacity-80 dark:drop-shadow-[0_0_8px_rgba(52,211,153,0.55)]"
          />
        </svg>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            key={statusText}
            className="rounded-full bg-muted/80 p-2.5 shadow-sm ring-1 ring-border backdrop-blur-sm duration-300 animate-in fade-in zoom-in-95 dark:bg-background/45 dark:shadow-[0_0_28px_rgba(52,211,153,0.22),0_0_42px_rgba(34,211,238,0.12)] dark:ring-emerald-400/45"
          >
            <StageIcon
              className="size-8 text-primary dark:text-emerald-100 dark:drop-shadow-[0_0_12px_rgba(52,211,153,0.65)]"
              strokeWidth={1.75}
              aria-hidden
            />
          </div>
        </div>
      </div>

      <div className="flex max-w-xs flex-col gap-1 text-center">
        <p
          key={statusText}
          className="text-foreground text-sm font-medium tracking-tight duration-300 animate-in fade-in slide-in-from-bottom-1 dark:text-emerald-100 dark:drop-shadow-[0_0_12px_rgba(52,211,153,0.35)]"
        >
          {statusText}
        </p>
      </div>

      <style>{`
        @keyframes compile-halo {
          0%, 100% { opacity: 0.12; transform: scale(0.96); }
          50%       { opacity: 0.22; transform: scale(1.04); }
        }
      `}</style>
    </div>
  )
}

function compileErrorText(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const base = err.fieldErrors.base?.[0]
    if (base) return base
    const first = Object.values(err.fieldErrors).flat()[0]
    if (first) return first
  }
  return fallback
}

export function ResumeCompileMarkdownDialog({
  open,
  onOpenChange,
  resumeId,
  resumeTitle,
  onCompiled,
  autoStart = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  resumeId: string
  resumeTitle: string
  onCompiled: (resume: ApiResume) => void | Promise<void>
  /** When true, opening the dialog immediately runs compile (no manual Generate click). */
  autoStart?: boolean
}) {
  const { t } = useTranslation(pagesI18nNs)
  const compileStages = React.useMemo<
    ReadonlyArray<{ label: string; Icon: LucideIcon }>
  >(
    () => [
      {
        label: t("resume.compile_markdown.stage_preparing"),
        Icon: FileText,
      },
      {
        label: t("resume.compile_markdown.stage_template"),
        Icon: FileCode2,
      },
      {
        label: t("resume.compile_markdown.stage_summary"),
        Icon: BrainCircuit,
      },
      {
        label: t("resume.compile_markdown.stage_work"),
        Icon: History,
      },
      {
        label: t("resume.compile_markdown.stage_edu_certs"),
        Icon: GraduationCap,
      },
      {
        label: t("resume.compile_markdown.stage_certs"),
        Icon: Award,
      },
      {
        label: t("resume.compile_markdown.stage_finalize"),
        Icon: Sparkles,
      },
    ],
    [t]
  )

  const [compiling, setCompiling] = React.useState(false)
  const [stageIndex, setStageIndex] = React.useState(0)
  const [error, setError] = React.useState<string | null>(null)
  const autoStartRanRef = React.useRef(false)

  React.useEffect(() => {
    if (!open) {
      setError(null)
      setCompiling(false)
      setStageIndex(0)
      autoStartRanRef.current = false
    }
  }, [open])

  React.useEffect(() => {
    if (!compiling) return
    setStageIndex(0)
    const id = window.setInterval(() => {
      setStageIndex((i) => (i + 1) % compileStages.length)
    }, COMPILE_STAGE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [compiling, compileStages.length])

  const handleCompile = React.useCallback(async () => {
    setError(null)
    setCompiling(true)
    try {
      const resume = await compileResumeMarkdown(resumeId)
      await onCompiled(resume)
      onOpenChange(false)
    } catch (err) {
      setError(
        compileErrorText(err, t("resume.compile_markdown.error_fallback"))
      )
    } finally {
      setCompiling(false)
    }
  }, [resumeId, onCompiled, onOpenChange, t])

  React.useLayoutEffect(() => {
    if (!open || !autoStart || autoStartRanRef.current) return
    autoStartRanRef.current = true
    void handleCompile()
  }, [open, autoStart, handleCompile])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("resume.compile_markdown.title")}</DialogTitle>
          <DialogDescription>
            {autoStart ? (
              <>
                {t("resume.compile_markdown.desc_auto_before")}
                <span className="text-foreground font-medium">{resumeTitle}</span>
                {t("resume.compile_markdown.desc_auto_after")}
              </>
            ) : (
              <>
                {t("resume.compile_markdown.desc_manual_before")}
                <span className="text-foreground font-medium">{resumeTitle}</span>
                {t("resume.compile_markdown.desc_manual_after")}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div
          className={[
            "flex min-h-[12rem] flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-4 py-8 transition-colors",
            compiling
              ? "border-primary/45 bg-muted/50 dark:border-emerald-500/40 dark:bg-[radial-gradient(ellipse_85%_70%_at_50%_42%,rgba(52,211,153,0.09),transparent_72%)] dark:shadow-[0_0_32px_-12px_rgba(52,211,153,0.35)]"
              : "border-muted-foreground/35 bg-muted/25",
          ].join(" ")}
        >
          {compiling ? (
            <CompileNeonRing stage={compileStages[stageIndex]!} />
          ) : (
            <div className="flex flex-col items-center gap-3 text-center text-muted-foreground">
              <FileCode2 className="size-10 opacity-60" />
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-foreground">
                  {t("resume.compile_markdown.ready_title")}
                </p>
                <p className="text-xs leading-relaxed">
                  {t("resume.compile_markdown.ready_body")}
                </p>
              </div>
            </div>
          )}
        </div>

        {error ? (
          <p className="text-destructive text-sm" role="alert">
            {error}
          </p>
        ) : null}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={compiling}
          >
            {t("shared.cancel")}
          </Button>
          {autoStart ? null : (
            <Button
              type="button"
              disabled={compiling}
              onClick={() => void handleCompile()}
            >
              {compiling ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" data-icon="inline-start" />
                  {t("resume.compile_markdown.generating")}
                </>
              ) : (
                <>
                  <Sparkles className="size-4" data-icon="inline-start" />
                  {t("resume.compile_markdown.generate")}
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
