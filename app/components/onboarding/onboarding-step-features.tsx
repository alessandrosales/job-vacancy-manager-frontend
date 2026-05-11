"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"

import { AuthUiLanguageSelect } from "~/components/auth/auth-ui-language-select"
import { LandingThemeToggle } from "~/components/landing/landing-theme-toggle"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { updateUser as patchUserApi } from "~/lib/api/resources/users"
import { getAuthToken } from "~/lib/auth-token"
import { pagesI18nNs } from "~/lib/i18n/config"
import type { UiLanguageCode } from "~/lib/i18n/preferred-language"
import { useSessionUserStore } from "~/stores/session-user-store"

export function OnboardingStepFeatures({
  onNext,
}: {
  onNext: () => void
}) {
  const { t } = useTranslation(pagesI18nNs)

  async function persistPreferredLanguageToProfile(code: UiLanguageCode) {
    const user = useSessionUserStore.getState().user
    const token = getAuthToken()
    if (!user.id || !token) return
    try {
      const updated = await patchUserApi(user.id, {
        preferred_language: code,
      })
      useSessionUserStore.getState().hydrateFromAuthMeResponse(token, updated)
    } catch {
      /* fallback: UI já mudou via syncAppLanguageTo */
    }
  }

  const items = React.useMemo(
    () =>
      [
        "registration_onboarding.feature_opportunities",
        "registration_onboarding.feature_resumes",
        "registration_onboarding.feature_companies",
        "registration_onboarding.feature_roles",
        "registration_onboarding.feature_ai",
      ] as const,
    []
  )

  return (
    <Card className="flex flex-1 flex-col border-border/80 bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-col gap-2">
        <CardTitle>{t("registration_onboarding.step1_title")}</CardTitle>
        <CardDescription>
          {t("registration_onboarding.step1_description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <ul className="flex flex-col gap-3 text-sm text-muted-foreground">
          {items.map((key) => (
            <li
              key={key}
              className="flex gap-3 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 ps-4 [list-style:none]"
            >
              <span
                className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"
                aria-hidden
              />
              <span className="leading-snug text-foreground">{t(key)}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex flex-row flex-wrap items-center justify-between gap-3 border-t pt-6">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <AuthUiLanguageSelect
            compact
            menuAlign="start"
            triggerClassName="max-w-full min-w-[10.5rem]"
            onLanguageCommitted={persistPreferredLanguageToProfile}
          />
          <LandingThemeToggle toggleButtonSize="icon-sm" />
        </div>
        <Button type="button" className="shrink-0" onClick={onNext}>
          {t("registration_onboarding.continue")}
        </Button>
      </CardFooter>
    </Card>
  )
}
