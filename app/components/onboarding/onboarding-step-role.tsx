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
import { createRole, listRoles } from "~/lib/api/resources/roles"
import { pagesI18nNs } from "~/lib/i18n/config"
import type { InterestLevel } from "~/lib/labels"
import { cn } from "~/lib/utils"

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

function isDuplicateNameApiError(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false
  const msgs = err.fieldErrors.name ?? []
  return msgs.some((m) => /taken|já está em uso|ya está en uso|unique/i.test(m))
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
  const [existingNamesLower, setExistingNamesLower] = React.useState<
    Set<string>
  >(() => new Set())
  const [rolesLoading, setRolesLoading] = React.useState(true)

  React.useEffect(() => {
    let cancelled = false
    void listRoles({ paginated: false })
      .then((rows) => {
        if (cancelled) return
        setExistingNamesLower(
          new Set(rows.map((r) => r.name.trim().toLowerCase()))
        )
      })
      .catch(() => {
        /* fallback: API valida no create */
      })
      .finally(() => {
        if (!cancelled) setRolesLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    const nameTrim = name.trim()
    const descriptionValue =
      description.trim() === "" ? null : description.trim()

    if (
      nameTrim !== "" &&
      existingNamesLower.has(nameTrim.toLowerCase())
    ) {
      setFormError(t("role.name_taken"))
      return
    }

    setSubmitting(true)
    try {
      await createRole({
        name: nameTrim,
        description: descriptionValue,
        interest_level: interestLevel,
      })
      onNext()
    } catch (err) {
      if (isDuplicateNameApiError(err)) {
        setFormError(t("role.name_taken"))
      } else {
        setFormError(formErrorMessage(err, t("role.form_error")))
      }
    } finally {
      setSubmitting(false)
    }
  }

  const nameTrim = name.trim()
  const nameDuplicate =
    !rolesLoading &&
    nameTrim !== "" &&
    existingNamesLower.has(nameTrim.toLowerCase())

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
            <Field data-invalid={nameDuplicate || undefined}>
              <FieldLabel htmlFor="onboard-role-name">
                {t("shared.name")}
              </FieldLabel>
              <Input
                id="onboard-role-name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setFormError(null)
                }}
                required
                disabled={submitting || rolesLoading}
                aria-invalid={nameDuplicate}
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
                disabled={submitting || rolesLoading}
                placeholder={t("shared.optional")}
              />
            </Field>
            <Field>
              <FieldLabel>{t("shared.interest_level")}</FieldLabel>
              <div
                className={cn(
                  submitting || rolesLoading
                    ? "pointer-events-none opacity-60"
                    : undefined
                )}
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
            disabled={submitting || rolesLoading}
            onClick={onBack}
          >
            {t("registration_onboarding.back")}
          </Button>
          <Button type="submit" disabled={submitting || rolesLoading}>
            {submitting || rolesLoading ? (
              <>
                <Loader2Icon
                  className="animate-spin"
                  data-icon="inline-start"
                />
                {rolesLoading ? t("role.load_loading") : t("shared.saving")}
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
