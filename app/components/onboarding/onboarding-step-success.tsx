"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"
import { PartyPopper } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardTitle,
} from "~/components/ui/card"
import { clearRegistrationOnboardingSession } from "~/lib/registration-onboarding-session"
import { pagesI18nNs } from "~/lib/i18n/config"
import { cn } from "~/lib/utils"

export function OnboardingStepSuccess({
  onBack,
}: {
  onBack: () => void
}) {
  const { t } = useTranslation(pagesI18nNs)
  const navigate = useNavigate()

  function goToResumes() {
    clearRegistrationOnboardingSession()
    navigate("/resumes", { replace: true })
  }

  return (
    <Card className="flex min-h-0 flex-1 flex-col border-border/80 bg-card/80 backdrop-blur-sm">
      <CardContent className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 px-4 py-8 text-center">
        <div
          className={cn(
            "onboarding-success-icon-ring flex size-14 items-center justify-center rounded-full ring-2",
            "bg-emerald-600/18 ring-emerald-700/45",
            "dark:bg-[rgba(57,255,20,0.16)] dark:ring-[rgba(57,255,20,0.4)]"
          )}
        >
          <PartyPopper
            className="size-7 text-emerald-800 dark:text-[#39ff14]"
            aria-hidden
          />
        </div>
        <div className="flex max-w-md flex-col gap-2">
          <CardTitle className="text-balance">
            {t("registration_onboarding.step5_title")}
          </CardTitle>
          <CardDescription className="text-balance">
            {t("registration_onboarding.step5_description")}
          </CardDescription>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-balance text-muted-foreground">
          {t("registration_onboarding.step5_hint")}
        </p>
      </CardContent>
      <CardFooter className="flex flex-wrap justify-end gap-2">
        <Button type="button" variant="outline" onClick={onBack}>
          {t("registration_onboarding.back")}
        </Button>
        <Button type="button" onClick={goToResumes}>
          {t("registration_onboarding.cta_resumes")}
        </Button>
      </CardFooter>
    </Card>
  )
}
