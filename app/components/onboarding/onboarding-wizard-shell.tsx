"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { cn } from "~/lib/utils"
import { pagesI18nNs } from "~/lib/i18n/config"

const TOTAL_STEPS = 5

export function OnboardingWizardShell({
  step,
  children,
}: {
  step: number
  children: React.ReactNode
}) {
  const { t } = useTranslation(pagesI18nNs)
  const title = t("home.title")

  return (
    <div className="relative flex min-h-svh flex-col">
      <div
        aria-hidden
        className="app-layout-crystal-bg pointer-events-none absolute inset-0"
      />
      <div className="relative flex flex-1 flex-col items-center gap-6 p-6 md:p-10">
        <header className="flex w-full max-w-lg flex-col gap-4">
          <div className="flex justify-center self-center">
            <img
              src="/logo-bg-light.png"
              alt={title}
              className="h-11 w-auto max-w-[min(100%,260px)] object-contain dark:hidden"
            />
            <img
              src="/logo-bg-dark.png"
              alt=""
              aria-hidden
              className="hidden h-11 w-auto max-w-[min(100%,260px)] object-contain dark:block"
            />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {t("registration_onboarding.step_of", {
              current: step,
              total: TOTAL_STEPS,
            })}
          </p>
          <div
            className="flex gap-2"
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={TOTAL_STEPS}
            aria-valuenow={step}
            aria-label={t("registration_onboarding.progress_aria")}
          >
            {Array.from({ length: TOTAL_STEPS }, (_, i) => {
              const n = i + 1
              const done = n < step
              const current = n === step
              return (
                <div
                  key={n}
                  className={cn(
                    "h-1.5 min-w-0 flex-1 rounded-full transition-colors",
                    done || current ? "bg-primary" : "bg-muted"
                  )}
                />
              )
            })}
          </div>
        </header>
        <div className="flex w-full max-w-lg flex-1 flex-col">{children}</div>
      </div>
    </div>
  )
}
