"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router"

import { AuthUiLanguageSelect } from "~/components/auth/auth-ui-language-select"
import { legalI18nNs, pagesI18nNs } from "~/lib/i18n/config"

type LegalDoc = "privacy" | "terms"

type LegalSection = { heading: string; body: string }

function readLegalSections(value: unknown): LegalSection[] {
  if (!Array.isArray(value)) return []
  return value.filter(
    (item): item is LegalSection =>
      typeof item === "object" &&
      item !== null &&
      "heading" in item &&
      "body" in item &&
      typeof (item as LegalSection).heading === "string" &&
      typeof (item as LegalSection).body === "string"
  )
}

export function LegalDocumentPage({ doc }: { doc: LegalDoc }) {
  const { t } = useTranslation(legalI18nNs)
  const { t: tp } = useTranslation(pagesI18nNs)

  React.useEffect(() => {
    document.title = `${t(`${doc}.doc_title`)} · ${tp("home.title")}`
  }, [doc, t, tp])

  const sections = readLegalSections(
    t(`${doc}.sections`, { returnObjects: true })
  )

  return (
    <div className="flex min-h-svh flex-col bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto grid min-h-14 max-w-3xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 px-4 py-3 sm:min-h-16 sm:px-6 sm:py-3">
          <nav
            aria-label={t("nav_aria")}
            className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-1 text-sm font-medium"
          >
            <Link
              to="/"
              className="rounded-md px-3 py-2 text-muted-foreground underline-offset-4 transition-colors hover:bg-accent hover:text-foreground"
            >
              {t("nav_home")}
            </Link>
            <span aria-hidden className="select-none text-muted-foreground/50">
              ·
            </span>
            <Link
              to="/login"
              className="rounded-md px-3 py-2 text-muted-foreground underline-offset-4 transition-colors hover:bg-accent hover:text-foreground"
            >
              {t("nav_login")}
            </Link>
            <span aria-hidden className="select-none text-muted-foreground/50">
              ·
            </span>
            <Link
              to="/register"
              className="rounded-md px-3 py-2 text-muted-foreground underline-offset-4 transition-colors hover:bg-accent hover:text-foreground"
            >
              {t("nav_register")}
            </Link>
          </nav>
          <div className="flex shrink-0 justify-self-end">
            <AuthUiLanguageSelect
              compact
              triggerSize="default"
              menuAlign="end"
              triggerClassName="max-w-[min(10.5rem,calc(100vw-12rem))] sm:max-w-none"
            />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-3xl font-semibold tracking-tight text-balance">
          {t(`${doc}.title`)}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t(`${doc}.updated`)}
        </p>
        <p className="mt-8 text-base leading-relaxed text-pretty text-muted-foreground">
          {t(`${doc}.intro`)}
        </p>
        <div className="mt-10 flex flex-col gap-10">
          {sections.map((section) => (
            <section key={section.heading} className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold tracking-tight">
                {section.heading}
              </h2>
              <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </main>
    </div>
  )
}
