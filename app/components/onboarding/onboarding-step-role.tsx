"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { Loader2Icon } from "lucide-react"

import { InterestLevelStarPicker } from "~/components/shared/interest-level-star-picker"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { ApiError } from "~/lib/api/errors"
import { createRole } from "~/lib/api/resources/roles"
import { pagesI18nNs } from "~/lib/i18n/config"
import type { InterestLevel } from "~/lib/labels"

function formErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const parts = [
      ...(err.fieldErrors.name ?? []),
      ...(err.fieldErrors.description ?? []),
      ...(err.fieldErrors.interest_level ?? []),
      ...(err.fieldErrors.base ?? []),
    ]
    if (parts.length > 0) return parts[0] ?? fallback
  }
  return fallback
}

export function OnboardingStepRole({
  onNext,
  onBack,
}: {
  onNext: () => void
  onBack: () => void
}) {
  const { t } = useTranslation(pagesI18nNs)

  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [interestLevel, setInterestLevel] = React.useState<InterestLevel>(3)
  const [submitting, setSubmitting] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    const nameTrim = name.trim()
    const descriptionValue =
      description.trim() === "" ? null : description.trim()

    setSubmitting(true)
    try {
      await createRole({
        name: nameTrim,
        description: descriptionValue,
        interest_level: interestLevel,
      })
      onNext()
    } catch (err) {
      setFormError(formErrorMessage(err, t("role.form_error")))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="flex flex-1 flex-col border-border/80 bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-col gap-2">
        <CardTitle>{t("registration_onboarding.step4_title")}</CardTitle>
        <CardDescription>
          {t("registration_onboarding.step4_description")}
        </CardDescription>
      </CardHeader>
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="flex flex-1 flex-col gap-4"
      >
        <CardContent className="flex flex-1 flex-col gap-4">
          <FieldGroup>
            {formError ? (
              <p className="text-sm text-destructive" role="alert">
                {formError}
              </p>
            ) : null}
            <Field>
              <FieldLabel htmlFor="onboard-role-name">
                {t("shared.name")}
              </FieldLabel>
              <Input
                id="onboard-role-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={submitting}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="onboard-role-desc">
                {t("shared.description")}
              </FieldLabel>
              <Textarea
                id="onboard-role-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                disabled={submitting}
                placeholder={t("shared.optional")}
              />
            </Field>
            <Field>
              <FieldLabel>{t("shared.interest_level")}</FieldLabel>
              <div
                className={
                  submitting ? "pointer-events-none opacity-60" : undefined
                }
              >
                <InterestLevelStarPicker
                  value={interestLevel}
                  onChange={setInterestLevel}
                />
              </div>
            </Field>
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
