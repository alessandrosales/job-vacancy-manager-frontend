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
import { Textarea } from "~/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { ApiError } from "~/lib/api/errors"
import type { ApiUserUpdate } from "~/lib/api/resources/users"
import { updateUser as patchUserApi } from "~/lib/api/resources/users"
import { getAuthToken } from "~/lib/auth-token"
import { pagesI18nNs } from "~/lib/i18n/config"
import { useSessionUserStore } from "~/stores/session-user-store"

function formErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const fe = err.fieldErrors
    const parts = [
      ...(fe.name ?? []),
      ...(fe.email ?? []),
      ...(fe.phone ?? []),
      ...(fe.bio ?? []),
      ...(fe.age ?? []),
      ...(fe.full_address ?? []),
      ...(fe.relationship_status ?? []),
      ...(fe.gender ?? []),
      ...(fe.preferred_language ?? []),
      ...(fe.base ?? []),
    ]
    if (parts.length > 0) return parts.join(" ")
  }
  return fallback
}

function parseAgeInput(
  raw: string
): { ok: true; value: number | null } | { ok: false } {
  const trimmed = raw.trim()
  if (!trimmed) return { ok: true, value: null }
  const n = Number(trimmed)
  if (!Number.isInteger(n) || n < 0 || n > 150) return { ok: false }
  return { ok: true, value: n }
}

export function OnboardingStepProfile({
  onNext,
  onBack,
}: {
  onNext: () => void
  onBack: () => void
}) {
  const { t } = useTranslation(pagesI18nNs)
  const user = useSessionUserStore((s) => s.user)

  const [phone, setPhone] = React.useState(user.phone)
  const [bio, setBio] = React.useState(user.bio)
  const [age, setAge] = React.useState(user.age)
  const [gender, setGender] = React.useState(user.gender)
  const [relationshipStatus, setRelationshipStatus] = React.useState(
    user.relationship_status
  )
  const [fullAddress, setFullAddress] = React.useState(user.full_address)
  const [preferredLanguage, setPreferredLanguage] = React.useState(
    user.preferred_language || "en"
  )

  React.useEffect(() => {
    setPhone(user.phone)
    setBio(user.bio)
    setAge(user.age)
    setGender(user.gender)
    setRelationshipStatus(user.relationship_status)
    setFullAddress(user.full_address)
    setPreferredLanguage(user.preferred_language || "en")
  }, [user])

  const [formError, setFormError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  const authTokenStored = getAuthToken()
  const loadingProfile = Boolean(authTokenStored) && user.id === ""

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)

    const ageResult = parseAgeInput(age)
    if (!ageResult.ok) {
      setFormError(t("my_data.age_invalid"))
      return
    }

    if (!user.id) {
      setFormError(t("my_data.profile_not_loaded"))
      return
    }

    setSubmitting(true)
    try {
      const patch: ApiUserUpdate = {
        phone: phone.trim(),
        avatar_url: user.avatar_url.trim(),
        bio: bio.trim(),
        age: ageResult.value,
        full_address: fullAddress.trim(),
        relationship_status: relationshipStatus.trim(),
        gender: gender.trim(),
        preferred_language: preferredLanguage,
      }
      const updated = await patchUserApi(user.id, patch)
      const tok = getAuthToken()
      if (tok) {
        useSessionUserStore.getState().hydrateFromAuthMeResponse(tok, updated)
      }
      onNext()
    } catch (err) {
      setFormError(formErrorMessage(err, t("my_data.form_error_fallback")))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="flex flex-1 flex-col border-border/80 bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-col gap-2">
        <CardTitle>{t("registration_onboarding.step2_title")}</CardTitle>
        <CardDescription>
          {t("registration_onboarding.step2_description")}
        </CardDescription>
      </CardHeader>
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="flex flex-1 flex-col gap-4"
      >
        <CardContent className="flex flex-1 flex-col gap-4">
          {loadingProfile ? (
            <p className="text-sm text-muted-foreground">
              {t("my_data.loading_profile")}
            </p>
          ) : (
            <FieldGroup>
              <div
                role="note"
                className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm leading-snug text-foreground"
              >
                {t("registration_onboarding.step2_resume_banner")}
              </div>
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
                <FieldLabel htmlFor="onboard-profile-phone">
                  {t("my_data.phone")}
                </FieldLabel>
                <Input
                  id="onboard-profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                  disabled={submitting}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="onboard-profile-bio">
                  {t("my_data.bio")}
                </FieldLabel>
                <Textarea
                  id="onboard-profile-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder={t("my_data.bio_placeholder")}
                  disabled={submitting}
                />
              </Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="onboard-profile-gender">
                    {t("my_data.gender")}
                  </FieldLabel>
                  <Input
                    id="onboard-profile-gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    autoComplete="sex"
                    disabled={submitting}
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="onboard-profile-age">
                    {t("my_data.age")}
                  </FieldLabel>
                  <Input
                    id="onboard-profile-age"
                    inputMode="numeric"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    autoComplete="off"
                    placeholder={t("my_data.age_placeholder")}
                    disabled={submitting}
                  />
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="onboard-profile-relationship">
                  {t("my_data.relationship_status")}
                </FieldLabel>
                <Input
                  id="onboard-profile-relationship"
                  value={relationshipStatus}
                  onChange={(e) => setRelationshipStatus(e.target.value)}
                  autoComplete="off"
                  disabled={submitting}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="onboard-profile-address">
                  {t("my_data.full_address")}
                </FieldLabel>
                <Textarea
                  id="onboard-profile-address"
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  rows={3}
                  autoComplete="street-address"
                  placeholder={t("my_data.address_placeholder")}
                  disabled={submitting}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="onboard-profile-preferred-language">
                  {t("my_data.preferred_language")}
                </FieldLabel>
                <Select
                  value={preferredLanguage}
                  onValueChange={setPreferredLanguage}
                  disabled={submitting}
                >
                  <SelectTrigger
                    id="onboard-profile-preferred-language"
                    className="w-full"
                  >
                    <SelectValue
                      placeholder={t("my_data.language_placeholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="en">{t("my_data.lang_en")}</SelectItem>
                      <SelectItem value="pt_br">
                        {t("my_data.lang_pt_br")}
                      </SelectItem>
                      <SelectItem value="es">{t("my_data.lang_es")}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  {t("my_data.preferred_language_hint")}
                </FieldDescription>
              </Field>
            </FieldGroup>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={submitting || loadingProfile}
            onClick={onBack}
          >
            {t("registration_onboarding.back")}
          </Button>
          <Button type="submit" disabled={submitting || loadingProfile}>
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
