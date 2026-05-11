"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Loader2Icon } from "lucide-react"

import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { ApiError } from "~/lib/api/errors"
import { updateUser as patchUserApi } from "~/lib/api/resources/users"
import { getAuthToken } from "~/lib/auth-token"
import { pagesI18nNs } from "~/lib/i18n/config"
import { useSessionUserStore } from "~/stores/session-user-store"

const OPENAI_API_KEYS_URL = "https://platform.openai.com/api-keys"

function formErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const fe = err.fieldErrors
    const parts = [...(fe.ai_token ?? []), ...(fe.base ?? [])]
    if (parts.length > 0) return parts.join(" ")
  }
  return fallback
}

export function OnboardingStepOpenAi({
  onNext,
  onBack,
}: {
  onNext: () => void
  onBack: () => void
}) {
  const { t } = useTranslation(pagesI18nNs)
  const user = useSessionUserStore((s) => s.user)
  const [openAiToken, setOpenAiToken] = React.useState("")
  const [formError, setFormError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)

    const trimmed = openAiToken.trim()
    if (!trimmed) {
      setFormError(t("registration_onboarding.openai_required"))
      return
    }

    if (!user.id) {
      setFormError(t("registration_onboarding.profile_not_ready"))
      return
    }

    setSubmitting(true)
    try {
      const updated = await patchUserApi(user.id, { ai_token: trimmed })
      const tok = getAuthToken()
      if (tok) {
        useSessionUserStore.getState().hydrateFromAuthMeResponse(tok, updated)
      }
      onNext()
    } catch (err) {
      setFormError(
        formErrorMessage(err, t("registration_onboarding.openai_save_error"))
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="flex flex-1 flex-col border-border/80 bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-col gap-2">
        <CardTitle>{t("registration_onboarding.step3_title")}</CardTitle>
        <CardDescription>
          {t("registration_onboarding.step3_description")}
        </CardDescription>
      </CardHeader>
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="flex flex-1 flex-col gap-4"
      >
        <CardContent className="flex flex-1 flex-col gap-4">
          <FieldGroup>
            {formError ? (
              <Field>
                <p
                  role="alert"
                  className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {formError}
                </p>
              </Field>
            ) : null}
            <Field>
              <FieldLabel htmlFor="onboard-openai-token">
                {t("registration_onboarding.openai_field_label")}
              </FieldLabel>
              <Input
                id="onboard-openai-token"
                type="password"
                autoComplete="off"
                value={openAiToken}
                onChange={(e) => setOpenAiToken(e.target.value)}
                placeholder={t("registration_onboarding.openai_placeholder")}
                disabled={submitting}
              />
              <FieldDescription>
                {t("registration_onboarding.openai_field_hint")}
              </FieldDescription>
            </Field>
            <p className="text-sm">
              <a
                href={OPENAI_API_KEYS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline underline-offset-4 hover:text-foreground"
              >
                {t("registration_onboarding.openai_keys_link")}
              </a>
            </p>
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={onBack}
          >
            {t("registration_onboarding.back")}
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2Icon
                  className="animate-spin"
                  data-icon="inline-start"
                />
                {t("shared.saving")}
              </>
            ) : (
              t("registration_onboarding.continue")
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
