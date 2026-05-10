"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router"

import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog"
import { getAuthToken } from "~/lib/auth-token"
import { pagesI18nNs } from "~/lib/i18n/config"
import {
  markOpenAiOnboardingHandledThisSession,
  shouldAutoOpenOpenAiOnboardingThisSession,
} from "~/lib/openai-key-onboarding-session"
import { useSessionUserStore } from "~/stores/session-user-store"

const OPENAI_API_KEYS_URL = "https://platform.openai.com/api-keys"

export function OpenAiKeyOnboardingDialog() {
  const { t } = useTranslation(pagesI18nNs)
  const [open, setOpen] = React.useState(false)

  const userId = useSessionUserStore((s) => s.user.id)
  const ai_token_configured = useSessionUserStore(
    (s) => s.user.ai_token_configured
  )
  const me_synced_for_token = useSessionUserStore((s) => s.me_synced_for_token)

  React.useEffect(() => {
    if (ai_token_configured) {
      markOpenAiOnboardingHandledThisSession()
      setOpen(false)
      return
    }

    const token = getAuthToken()
    const synced = token != null && token === me_synced_for_token
    const needsKey = Boolean(userId)
    if (!synced || !needsKey) return

    if (!shouldAutoOpenOpenAiOnboardingThisSession()) return

    setOpen(true)
  }, [userId, ai_token_configured, me_synced_for_token])

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (!next) {
      markOpenAiOnboardingHandledThisSession()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {/*
        Render só com open=true evita overlay preso: Presence do Radix espera animationend na saída;
        se a animação CSS não completar, o layer pode ficar invisível mas ainda com pointer-events.
      */}
      {open ? (
        <DialogContent className="sm:max-w-lg" showCloseButton>
          <DialogHeader>
            <DialogTitle>{t("openai_onboarding.title")}</DialogTitle>
            <DialogDescription>
              {t("openai_onboarding.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="font-medium text-foreground">
                {t("openai_onboarding.steps_heading")}
              </p>
              <ol className="flex [list-style-type:decimal] flex-col gap-3 ps-5 text-muted-foreground">
                <li>{t("openai_onboarding.step1")}</li>
                <li>{t("openai_onboarding.step2")}</li>
                <li>{t("openai_onboarding.step3")}</li>
              </ol>
            </div>

            <p>
              <a
                href={OPENAI_API_KEYS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline underline-offset-4 hover:text-foreground"
              >
                {t("openai_onboarding.openai_keys_link")}
              </a>
            </p>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                {t("openai_onboarding.dismiss")}
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="button" asChild>
                <Link to="/my-data">{t("openai_onboarding.cta_my_data")}</Link>
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      ) : null}
    </Dialog>
  )
}
