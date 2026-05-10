"use client"

import { useEffect, useRef, type RefObject, type SVGProps } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router"
import {
  BotIcon,
  BriefcaseIcon,
  FilesIcon,
  FileDownIcon,
  KanbanIcon,
  QuoteIcon,
  SparklesIcon,
  TrendingUpIcon,
} from "lucide-react"

import { AuthUiLanguageSelect } from "~/components/auth/auth-ui-language-select"
import { LandingCookieBanner } from "~/components/landing/landing-cookie-banner"
import { LandingMobileNavDrawer } from "~/components/landing/landing-mobile-nav-drawer"
import { LandingThemeToggle } from "~/components/landing/landing-theme-toggle"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Separator } from "~/components/ui/separator"
import { landingI18nNs, pagesI18nNs } from "~/lib/i18n/config"

const featureDefs = [
  { k: "linkedin_pdf" as const, Icon: FileDownIcon },
  { k: "export_formats" as const, Icon: FilesIcon },
  { k: "ats_resume" as const, Icon: SparklesIcon },
  { k: "opportunities" as const, Icon: BriefcaseIcon },
  { k: "insights" as const, Icon: TrendingUpIcon },
  { k: "advanced_org" as const, Icon: KanbanIcon },
] as const

type ScenarioRow = { title: string; body: string }
type CompareRow = { chaos: string; hireest: string }
type FaqRow = { q: string; a: string }
type TestimonialRow = { quote: string; name: string; role: string }

function readObjectArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : []
}

/** Parallax no fundo: desloca a imagem e varia o recorte vertical conforme o scroll. */
function useParallaxSectionBg(
  sectionRef: RefObject<HTMLElement | null>,
  bgRef: RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    const section = sectionRef.current
    const bg = bgRef.current
    if (!section || !bg) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }

    let rafId = 0

    const tick = () => {
      rafId = 0
      const el = sectionRef.current
      const layer = bgRef.current
      if (!el || !layer) return

      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight
      const h = Math.max(1, rect.height)
      const denom = vh + h
      const p = Math.min(1, Math.max(0, (vh - rect.top) / denom))
      const translateY = (p - 0.5) * -150
      const bgYPercent = 16 + p * 68
      layer.style.transform = `translate3d(0, ${translateY}px, 0)`
      layer.style.backgroundPosition = `center ${bgYPercent}%`
    }

    const schedule = () => {
      if (rafId !== 0) return
      rafId = requestAnimationFrame(tick)
    }

    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    schedule()

    return () => {
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      cancelAnimationFrame(rafId)
    }
  }, [sectionRef, bgRef])
}

function LinkedInGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  )
}

function GitHubGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.775.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

function XGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

const footerSocialLinks = [
  {
    href: "https://www.linkedin.com/company/hireest",
    labelKey: "footer.social_linkedin",
    Icon: LinkedInGlyph,
  },
  {
    href: "https://github.com/hireest",
    labelKey: "footer.social_github",
    Icon: GitHubGlyph,
  },
  {
    href: "https://x.com/hireest",
    labelKey: "footer.social_x",
    Icon: XGlyph,
  },
] as const

/** Borda + glow primary nos cards “compare”; mobile mantém suave, desktop (md+) mais forte. */
const compareCardNeonClass =
  "relative h-full gap-0 overflow-hidden rounded-2xl border border-primary/32 bg-transparent py-0 ring-0 shadow-[0_0_18px_color-mix(in_oklch,var(--primary)_14%,transparent),0_0_42px_color-mix(in_oklch,var(--primary)_6%,transparent)] md:border-2 md:border-primary/62 md:shadow-[0_0_30px_color-mix(in_oklch,var(--primary)_34%,transparent),0_0_68px_color-mix(in_oklch,var(--primary)_16%,transparent),0_0_112px_color-mix(in_oklch,var(--primary)_9%,transparent)] dark:border-primary/46 dark:shadow-[0_0_22px_color-mix(in_oklch,var(--primary)_18%,transparent),0_0_50px_color-mix(in_oklch,var(--primary)_8%,transparent)] dark:md:border-2 dark:md:border-primary/85 dark:md:shadow-[0_0_38px_color-mix(in_oklch,var(--primary)_46%,transparent),0_0_90px_color-mix(in_oklch,var(--primary)_22%,transparent),0_0_144px_color-mix(in_oklch,var(--primary)_12%,transparent)] dark:ring-0"

/**
 * Landing pública de marketing — cada seção usa um padrão de layout distinto.
 * Hero: 2-col + dot grid | Problem: rows tipográficos | Steps: stepper |
 * Pillars: split 5/7 | Compare: dois cards | Features: grid 3×2 (6 destaques) |
 * Assistant: faixa + cards | Depoimentos: 3 cards | FAQ: 5/7 | CTA final: parallax.
 */
export function LandingPage() {
  const { t } = useTranslation(landingI18nNs)
  const { t: tp } = useTranslation(pagesI18nNs)
  const brand = tp("home.title")

  const ctaMidSectionRef = useRef<HTMLElement>(null)
  const ctaMidBgRef = useRef<HTMLDivElement>(null)
  useParallaxSectionBg(ctaMidSectionRef, ctaMidBgRef)

  const ctaFinalSectionRef = useRef<HTMLElement>(null)
  const ctaFinalBgRef = useRef<HTMLDivElement>(null)
  useParallaxSectionBg(ctaFinalSectionRef, ctaFinalBgRef)

  const scenarios = readObjectArray<ScenarioRow>(
    t("problem.scenarios", { returnObjects: true })
  )
  const steps = readObjectArray<ScenarioRow>(
    t("steps.items", { returnObjects: true })
  )
  const compareRows = readObjectArray<CompareRow>(
    t("compare.rows", { returnObjects: true })
  )
  const faqItems = readObjectArray<FaqRow>(
    t("faq_items", { returnObjects: true })
  )
  const testimonials = readObjectArray<TestimonialRow>(
    t("testimonials.items", { returnObjects: true })
  ).filter(
    (row): row is TestimonialRow =>
      typeof row.quote === "string" &&
      typeof row.name === "string" &&
      typeof row.role === "string"
  )
  const assistantBullets = readObjectArray<unknown>(
    t("assistant_section.bullets", { returnObjects: true })
  ).filter((line): line is string => typeof line === "string")

  return (
    <div className="relative flex min-h-svh flex-col bg-background text-foreground">
      {/* ── HEADER ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="mx-auto grid min-h-14 w-full max-w-6xl grid-cols-[1fr_auto] items-center gap-3 px-4 py-2 sm:min-h-16 md:grid-cols-[auto_minmax(0,1fr)] md:gap-x-4 md:px-6 md:py-0 lg:px-8">
          <Link
            to="/"
            className="relative z-10 col-start-1 row-start-1 flex w-fit shrink-0 items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <img
              src="/logo-bg-light.png"
              alt={brand}
              className="h-8 w-auto max-w-[min(11rem,52vw)] object-contain sm:h-9 sm:max-w-[200px] dark:hidden"
            />
            <img
              src="/logo-bg-dark.png"
              alt=""
              aria-hidden
              className="hidden h-8 w-auto max-w-[min(11rem,52vw)] object-contain sm:h-9 sm:max-w-[200px] dark:block"
            />
          </Link>

          <div className="col-start-2 row-start-1 flex items-center justify-end gap-2 md:hidden">
            <LandingThemeToggle />
            <LandingMobileNavDrawer />
          </div>

          <nav
            aria-label={t("nav.aria_label")}
            className="col-start-2 row-start-1 hidden min-w-0 flex-wrap items-center justify-end gap-x-3 gap-y-2 md:flex"
          >
            <AuthUiLanguageSelect
              compact
              triggerSize="default"
              menuAlign="end"
              triggerClassName="max-w-none sm:min-w-[10.5rem]"
            />
            <div className="flex h-8 shrink-0 flex-wrap items-center justify-end gap-2">
              <LandingThemeToggle />
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="shrink-0 px-2.5"
              >
                <Link to="/login">{t("nav.sign_in")}</Link>
              </Button>
              <Button asChild size="sm" className="shrink-0">
                <Link to="/register">{t("nav.start_free")}</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 flex-col">
        {/* ── HERO — mobile: foto full-bleed de fundo | desktop: 2-col + dot grid ───────── */}
        <section className="relative min-h-[min(72svh,40rem)] overflow-hidden lg:min-h-0">
          {/* Mobile only: hero photo as section background */}
          <div
            className="pointer-events-none absolute inset-0 bg-cover bg-[center_20%] bg-no-repeat lg:hidden"
            style={{ backgroundImage: "url(/photo-hero.jpg)" }}
            aria-hidden
          />
          {/* Mobile only: scrim so headline/CTAs stay legible on light photo */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background/92 lg:hidden"
            aria-hidden
          />

          {/* Dot grid — desktop only (foto já cobre o hero no mobile) */}
          <div
            className="pointer-events-none absolute inset-0 hidden text-foreground opacity-[0.035] lg:block"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='1.5' cy='1.5' r='1.5' fill='currentColor'/%3E%3C/svg%3E")`,
              backgroundSize: "24px 24px",
            }}
            aria-hidden
          />
          {/* Fade dots out toward bottom */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-40 bg-gradient-to-t from-background to-transparent lg:block"
            aria-hidden
          />
          {/* Primary color bloom top-left */}
          <div
            className="pointer-events-none absolute -top-40 -left-40 hidden size-[40rem] rounded-full bg-primary/10 blur-3xl lg:block"
            aria-hidden
          />

          <div className="relative z-10 mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_auto] lg:px-8 lg:py-28">
            {/* Left: text + CTAs */}
            <div className="flex max-w-2xl flex-col gap-6">
              <Badge variant="secondary" className="w-fit font-medium">
                {t("hero.eyebrow")}
              </Badge>
              <h1 className="font-heading text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                {t("hero.headline")}
              </h1>
              <p className="text-lg text-pretty text-muted-foreground sm:text-xl">
                {t("hero.subhead")}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Button asChild size="lg" className="sm:min-w-[12rem]">
                  <Link to="/register">{t("hero.cta_primary")}</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="sm:min-w-[12rem]"
                >
                  <Link to="/login">{t("hero.cta_secondary")}</Link>
                </Button>
              </div>
            </div>

            {/* Right: hero photo (hidden below lg) */}
            <div className="hidden lg:block lg:shrink-0">
              <div className="relative size-72 overflow-hidden rounded-2xl ring-1 ring-border/40 xl:size-80">
                <img
                  src="/photo-hero.jpg"
                  alt=""
                  aria-hidden
                  className="size-full object-cover object-top"
                />
                {/* subtle primary tint overlay to tie into brand palette */}
                <div
                  className="pointer-events-none absolute inset-0 bg-primary/6 mix-blend-multiply dark:mix-blend-screen"
                  aria-hidden
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── PROBLEM — numbered typography rows ──────────────────── */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mb-10 flex max-w-2xl flex-col gap-3">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("problem.title")}
            </h2>
            <p className="text-pretty text-muted-foreground">
              {t("problem.intro")}
            </p>
          </div>

          <div className="flex flex-col">
            {scenarios.map((row, index) => (
              <div
                key={row.title}
                className="grid grid-cols-[3.5rem_1fr] items-start gap-x-6 border-t border-border/50 py-8 last:border-b sm:grid-cols-[5rem_1fr]"
              >
                <span className="pt-0.5 text-4xl leading-none font-bold text-muted-foreground/20 tabular-nums select-none sm:text-5xl">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="flex flex-col gap-2">
                  <p className="text-lg leading-snug font-semibold sm:text-xl">
                    {row.title}
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {row.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── STEPS — stepper with connector line ─────────────────── */}
        <section className="bg-muted/30 py-16 sm:py-20">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 sm:px-6 lg:px-8">
            <div className="flex max-w-2xl flex-col gap-3 md:mx-auto md:text-center">
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {t("steps.title")}
              </h2>
              <p className="text-pretty text-muted-foreground">
                {t("steps.subtitle")}
              </p>
            </div>

            {/* Desktop: um passo por coluna — círculo e texto no mesmo li (centrados) + linha entre centros */}
            <div className="relative hidden md:block">
              <div
                className="pointer-events-none absolute top-[1.125rem] right-[16.667%] left-[16.667%] z-0 h-px -translate-y-1/2 bg-primary/50"
                aria-hidden
              />
              <ol className="relative z-[1] m-0 grid list-none grid-cols-3 gap-x-6 p-0 lg:gap-x-10">
                {steps.map((step, index) => (
                  <li
                    key={step.title}
                    className="flex flex-col items-center gap-4 text-center text-balance"
                  >
                    <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground ring-4 ring-background">
                      {index + 1}
                    </span>
                    <div className="flex flex-col gap-2">
                      <p className="leading-snug font-semibold">{step.title}</p>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {step.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Mobile: uma coluna vertical contínua; círculos por cima da linha (z-10) */}
            <ol className="relative m-0 flex list-none flex-col gap-10 p-0 pt-0.5 md:hidden">
              <div
                className="pointer-events-none absolute start-[1.125rem] top-0 bottom-0 z-0 w-px -translate-x-1/2 bg-primary/50"
                aria-hidden
              />
              {steps.map((step, index) => (
                <li key={step.title} className="relative z-[1] flex gap-5">
                  <span className="relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground ring-4 ring-background">
                    {index + 1}
                  </span>
                  <div className="flex min-w-0 flex-col gap-2 pt-0.5">
                    <p className="leading-snug font-semibold">{step.title}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {step.body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── CTA MID — foto de fundo + scrim + parallax no scroll ─ */}
        <section
          ref={ctaMidSectionRef}
          className="relative overflow-hidden border-y border-border py-24 sm:py-32 md:py-40"
        >
          <div
            ref={ctaMidBgRef}
            className="pointer-events-none absolute inset-x-0 -top-[32%] -bottom-[32%] bg-cover bg-center bg-no-repeat will-change-transform"
            style={{ backgroundImage: "url(/bg-cta.jpg)" }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-background/80 dark:bg-background/88"
            aria-hidden
          />
          <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center gap-7 px-4 text-center sm:px-6">
            <h2 className="text-xl font-semibold tracking-tight text-balance text-foreground sm:text-2xl">
              {t("cta_mid.title")}
            </h2>
            <p className="max-w-prose text-pretty text-foreground/85">
              {t("cta_mid.body")}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
              <Button asChild size="lg">
                <Link to="/register">{t("cta_mid.primary")}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/login">{t("cta_mid.secondary")}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* ── PILLARS — asymmetric 5/7 split ──────────────────────── */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            {/* Left: statement + CTA */}
            <div className="flex flex-col justify-center gap-6 lg:col-span-5">
              <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl lg:text-4xl">
                {t("pillars.title")}
              </h2>
              <Button asChild size="lg" className="w-fit">
                <Link to="/register">{t("hero.cta_primary")}</Link>
              </Button>
            </div>

            {/* Right: stacked items with primary left accent */}
            <div className="flex flex-col lg:col-span-7">
              {(["workspace", "global", "ats"] as const).map((key) => (
                <div
                  key={key}
                  className="flex gap-5 border-b border-border/60 py-6 first:pt-0 last:border-0 last:pb-0"
                >
                  <div className="w-0.5 shrink-0 self-stretch rounded-full bg-primary" />
                  <div className="flex flex-col gap-1.5">
                    <p className="font-semibold">
                      {t(`pillars.items.${key}.title`)}
                    </p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {t(`pillars.items.${key}.body`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Separator />

        {/* ── COMPARE — dois cards, caos × Hireest ─────────────────── */}
        <section className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <h2 className="mb-8 max-w-2xl text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            {t("compare.title")}
          </h2>
          <div className="grid gap-6 md:grid-cols-2 md:items-stretch md:gap-8">
            <Card className={compareCardNeonClass}>
              <div
                className="pointer-events-none absolute inset-0 bg-cover bg-[center_35%] bg-no-repeat sm:bg-center"
                style={{ backgroundImage: "url(/teenager-sad.jpg)" }}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 bg-background/88 dark:bg-background/92"
                aria-hidden
              />
              <CardHeader className="relative z-10 border-b border-border/50 px-5 pt-5 pb-4 sm:px-6 sm:pt-6 dark:border-b-white/[0.06]">
                <CardTitle className="text-base font-semibold text-foreground/70 sm:text-lg">
                  {t("compare.col_chaos")}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 flex flex-1 flex-col gap-0 px-5 pt-4 pb-5 sm:px-6 sm:pb-6">
                <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
                  {compareRows.map((row, rowIndex) => (
                    <li
                      key={`compare-chaos-${String(rowIndex)}`}
                      className="text-sm leading-relaxed text-pretty text-foreground/72 line-through decoration-foreground/35"
                    >
                      {row.chaos}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className={compareCardNeonClass}>
              <div
                className="pointer-events-none absolute inset-0 bg-cover bg-[center_25%] bg-no-repeat sm:bg-[center_20%]"
                style={{ backgroundImage: "url(/teenager-happy.jpg)" }}
                aria-hidden
              />
              <div
                className="pointer-events-none absolute inset-0 bg-background/78 dark:bg-background/85"
                aria-hidden
              />
              <CardHeader className="relative z-10 border-b border-primary/20 bg-primary/10 px-5 pt-5 pb-4 backdrop-blur-[2px] sm:px-6 sm:pt-6 dark:border-b-primary/12 dark:bg-primary/8">
                <CardTitle className="text-base font-semibold text-foreground sm:text-lg">
                  {t("compare.col_hireest")}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10 flex flex-1 flex-col gap-0 px-5 pt-4 pb-5 sm:px-6 sm:pb-6">
                <ul className="m-0 flex list-none flex-col gap-3.5 p-0">
                  {compareRows.map((row, rowIndex) => (
                    <li
                      key={`compare-hireest-${String(rowIndex)}`}
                      className="text-sm leading-relaxed font-medium text-pretty text-foreground"
                    >
                      {row.hireest}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── FEATURES — grid 3×2, seis destaques de produto ─────────── */}
        <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mb-10 flex max-w-2xl flex-col gap-3">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {t("features.title")}
            </h2>
            <p className="text-pretty text-muted-foreground">
              {t("features.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featureDefs.map(({ k, Icon }) => (
              <div
                key={k}
                className="flex flex-col gap-4 rounded-xl bg-muted/40 p-6 ring-1 ring-border/60"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background text-primary ring-1 ring-border/60">
                  <Icon className="size-5" aria-hidden />
                </div>
                <div className="flex flex-col gap-1.5">
                  <p className="text-base leading-snug font-semibold">
                    {t(`features.${k}.title`)}
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(`features.${k}.desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── ASSISTANT — faixa + cabeçalho editorial + 3 cards (≠ FAQ 5/7) ─ */}
        <section className="border-y border-border/50 bg-muted/20 py-16 sm:py-20">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
            <div
              className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/25 dark:bg-primary/15 dark:ring-primary/20"
              aria-hidden
            >
              <BotIcon className="size-7" />
            </div>
            <Badge
              variant="outline"
              className="mt-5 border-primary/45 bg-primary/8 px-3 py-1 text-xs font-semibold text-primary sm:mt-6 dark:bg-primary/12"
            >
              {t("assistant_section.coming_soon")}
            </Badge>
            <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:mt-5 sm:text-4xl">
              {t("assistant_section.title")}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground sm:mt-5 sm:text-lg">
              {t("assistant_section.intro")}
            </p>

            <ul className="m-0 mt-12 grid w-full list-none grid-cols-1 gap-4 p-0 md:mt-14 md:grid-cols-3 md:gap-5">
              {assistantBullets.map((line) => (
                <li
                  key={line}
                  className="flex gap-3 rounded-xl border border-border/60 bg-background/80 p-5 text-start shadow-sm dark:border-white/[0.06] dark:bg-card/50 dark:shadow-none dark:ring-1 dark:ring-foreground/[0.04] dark:ring-inset"
                >
                  <span
                    className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                    aria-hidden
                  />
                  <span className="text-sm leading-relaxed text-pretty text-muted-foreground">
                    {line}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── DEPOIMENTOS — 3 cards acima do FAQ ─────────────────────── */}
        <section
          aria-labelledby="landing-testimonials-heading"
          className="border-t border-border/40 bg-muted/15 py-16 sm:py-20"
        >
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <h2
                id="landing-testimonials-heading"
                className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl"
              >
                {t("testimonials.title")}
              </h2>
              <p className="mt-3 text-pretty text-muted-foreground">
                {t("testimonials.subtitle")}
              </p>
            </div>
            <ul className="m-0 grid list-none grid-cols-1 gap-5 p-0 md:grid-cols-3 md:gap-6">
              {testimonials.map((item) => (
                <li key={`${item.name}-${item.role}`}>
                  <figure className="flex h-full flex-col rounded-2xl border border-border/60 bg-background/90 p-6 shadow-sm ring-1 ring-foreground/[0.03] dark:border-white/[0.06] dark:bg-card/60 dark:shadow-none dark:ring-white/[0.04] dark:ring-inset">
                    <QuoteIcon
                      className="size-8 shrink-0 text-primary/35 dark:text-primary/40"
                      aria-hidden
                    />
                    <blockquote className="mt-4 flex flex-1 flex-col">
                      <p className="text-sm leading-relaxed text-pretty text-foreground/90">
                        “{item.quote}”
                      </p>
                    </blockquote>
                    <figcaption className="mt-6 border-t border-border/50 pt-5 dark:border-white/[0.06]">
                      <cite className="text-sm font-semibold text-foreground not-italic">
                        {item.name}
                      </cite>
                      <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                        {item.role}
                      </p>
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── FAQ — mesma largura max-w-6xl + split 5/7 (ritmo editorial) */}
        <section
          id="landing-faq"
          className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
        >
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="flex flex-col gap-2 lg:col-span-5">
              <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl lg:text-4xl">
                {t("faq.title")}
              </h2>
              <p className="text-pretty text-muted-foreground">
                {t("faq.subtitle")}
              </p>
            </div>
            <div className="lg:col-span-7">
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={item.q} value={`faq-${String(index)}`}>
                    <AccordionTrigger className="text-start">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="leading-relaxed text-muted-foreground">
                        {item.a}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* ── CTA FINAL — foto + overlay primary + parallax ─────────── */}
        <section
          ref={ctaFinalSectionRef}
          className="relative overflow-hidden py-[4.9rem] sm:py-[6.3rem] md:py-[7.7rem] lg:py-[9.1rem]"
        >
          <div
            ref={ctaFinalBgRef}
            className="pointer-events-none absolute inset-x-0 -top-[24%] -bottom-[24%] bg-cover bg-center bg-no-repeat will-change-transform"
            style={{ backgroundImage: "url(/bg-last-cta.jpg)" }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/[0.78] via-primary/[0.68] to-primary/[0.82] dark:from-primary/[0.82] dark:via-primary/[0.72] dark:to-primary/[0.88]"
            aria-hidden
          />
          <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 text-center sm:gap-7 sm:px-6">
            <h2 className="text-2xl font-semibold tracking-tight text-balance text-primary-foreground sm:text-3xl">
              {t("cta.title")}
            </h2>
            <p className="max-w-prose text-pretty text-primary-foreground/85">
              {t("cta.body")}
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link to="/register">{t("cta.button")}</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* ── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8 px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-4 text-center">
            <Link
              to="/"
              className="flex shrink-0 items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <img
                src="/logo-bg-light.png"
                alt={brand}
                className="h-[2.925rem] w-auto max-w-[min(15.6rem,91vw)] object-contain sm:h-[3.25rem] dark:hidden"
              />
              <img
                src="/logo-bg-dark.png"
                alt=""
                aria-hidden
                className="hidden h-[2.925rem] w-auto max-w-[min(15.6rem,91vw)] object-contain sm:h-[3.25rem] dark:block"
              />
            </Link>
            <p className="max-w-xl text-sm font-medium text-pretty text-foreground sm:text-base">
              {t("footer.tagline")}
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm"
          >
            <Link
              to="/login"
              className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {t("footer.link_login")}
            </Link>
            <Link
              to="/register"
              className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {t("footer.link_register")}
            </Link>
            <a
              href="#landing-faq"
              className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {t("footer.link_faq")}
            </a>
          </nav>

          <nav
            aria-label={t("footer.social_nav_aria")}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"
          >
            {footerSocialLinks.map(({ href, labelKey, Icon }) => (
              <a
                key={labelKey}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t(labelKey)}
                className="flex size-10 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground transition-colors hover:border-primary/45 hover:text-primary sm:size-11"
              >
                <Icon className="size-[1.125rem] sm:size-5" />
              </a>
            ))}
          </nav>

          <nav
            aria-label={t("footer.legal_nav_aria")}
            className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground"
          >
            <Link
              to="/terms-of-use"
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              {t("footer.link_terms")}
            </Link>
            <span aria-hidden className="text-border select-none">
              ·
            </span>
            <Link
              to="/privacy-policy"
              className="underline-offset-4 hover:text-foreground hover:underline"
            >
              {t("footer.link_privacy")}
            </Link>
          </nav>
          <p className="text-center text-xs text-muted-foreground">
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </footer>
      <LandingCookieBanner />
    </div>
  )
}
