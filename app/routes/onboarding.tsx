"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"

import { AuthenticatedSessionBootstrap } from "~/components/layout/authenticated-session-bootstrap"
import { OnboardingStepFeatures } from "~/components/onboarding/onboarding-step-features"
import { OnboardingStepOpenAi } from "~/components/onboarding/onboarding-step-openai"
import { OnboardingStepProfile } from "~/components/onboarding/onboarding-step-profile"
import { OnboardingStepRole } from "~/components/onboarding/onboarding-step-role"
import { OnboardingStepSuccess } from "~/components/onboarding/onboarding-step-success"
import { OnboardingWizardShell } from "~/components/onboarding/onboarding-wizard-shell"
import { getAuthToken } from "~/lib/auth-token"
import { pagesI18nNs } from "~/lib/i18n/config"
import {
  getRegistrationOnboardingStep,
  isPendingRegistrationOnboarding,
  setRegistrationOnboardingStep,
} from "~/lib/registration-onboarding-session"
import { rehydrateAppStores } from "~/stores/rehydrate-app-stores"

export default function OnboardingPage() {
  const { t } = useTranslation(pagesI18nNs)
  const navigate = useNavigate()
  const [guardReady, setGuardReady] = React.useState(false)
  const [step, setStep] = React.useState(1)

  React.useEffect(() => {
    document.title = `${t("registration_onboarding.doc_title")} · ${t("home.title")}`
  }, [t])

  React.useEffect(() => {
    let cancelled = false
    void (async () => {
      await rehydrateAppStores()
      if (cancelled) return
      if (!getAuthToken()) {
        navigate("/login", { replace: true })
        return
      }
      if (!isPendingRegistrationOnboarding()) {
        navigate("/dashboard", { replace: true })
        return
      }
      setStep(getRegistrationOnboardingStep())
      setGuardReady(true)
    })()
    return () => {
      cancelled = true
    }
  }, [navigate])

  React.useEffect(() => {
    if (!guardReady) return
    setRegistrationOnboardingStep(step)
  }, [step, guardReady])

  const goNext = React.useCallback(() => {
    setStep((s) => Math.min(5, s + 1))
  }, [])

  const goBack = React.useCallback(() => {
    setStep((s) => Math.max(1, s - 1))
  }, [])

  if (!guardReady) {
    return (
      <>
        <AuthenticatedSessionBootstrap />
        <div className="flex min-h-svh items-center justify-center bg-muted">
          <p className="text-sm text-muted-foreground">
            {t("registration_onboarding.loading")}
          </p>
        </div>
      </>
    )
  }

  return (
    <>
      <AuthenticatedSessionBootstrap />
      <OnboardingWizardShell step={step}>
        {step === 1 ? <OnboardingStepFeatures onNext={goNext} /> : null}
        {step === 2 ? (
          <OnboardingStepProfile onNext={goNext} onBack={goBack} />
        ) : null}
        {step === 3 ? (
          <OnboardingStepOpenAi onNext={goNext} onBack={goBack} />
        ) : null}
        {step === 4 ? (
          <OnboardingStepRole onNext={goNext} onBack={goBack} />
        ) : null}
        {step === 5 ? <OnboardingStepSuccess onBack={goBack} /> : null}
      </OnboardingWizardShell>
    </>
  )
}
