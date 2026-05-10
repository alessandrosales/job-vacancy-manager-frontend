"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router"

import { AppLayout } from "~/components/layout/app-layout"
import { useSessionUser } from "~/components/providers/session-user-provider"
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Textarea } from "~/components/ui/textarea"
import { ApiError } from "~/lib/api/errors"
import type { ApiUserUpdate } from "~/lib/api/resources/users"
import { updateUser as patchUserApi } from "~/lib/api/resources/users"
import { pagesI18nNs } from "~/lib/i18n/config"
import { getAuthToken } from "~/lib/auth-token"
import { useSessionUserStore } from "~/stores/session-user-store"

function formErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    const fe = err.fieldErrors
    const parts = [
      ...(fe.name ?? []),
      ...(fe.email ?? []),
      ...(fe.phone ?? []),
      ...(fe.avatar_url ?? []),
      ...(fe.bio ?? []),
      ...(fe.age ?? []),
      ...(fe.full_address ?? []),
      ...(fe.relationship_status ?? []),
      ...(fe.gender ?? []),
      ...(fe.preferred_language ?? []),
      ...(fe.ai_token ?? []),
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

export default function MyDataPage() {
  const { t: tp } = useTranslation(pagesI18nNs)
  const { t: tc } = useTranslation("common")
  const navigate = useNavigate()
  const { user } = useSessionUser()

  const [name, setName] = React.useState(user.name)
  const [email, setEmail] = React.useState(user.email)
  const [phone, setPhone] = React.useState(user.phone)
  const [avatarUrl, setAvatarUrl] = React.useState(user.avatar_url)
  const [bio, setBio] = React.useState(user.bio)
  const [age, setAge] = React.useState(user.age)
  const [fullAddress, setFullAddress] = React.useState(user.full_address)
  const [relationshipStatus, setRelationshipStatus] = React.useState(
    user.relationship_status
  )
  const [gender, setGender] = React.useState(user.gender)
  const [preferredLanguage, setPreferredLanguage] = React.useState(
    user.preferred_language || "en"
  )
  const [openAiToken, setOpenAiToken] = React.useState("")
  const [removeOpenAiToken, setRemoveOpenAiToken] = React.useState(false)

  const [formError, setFormError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  React.useEffect(() => {
    setName(user.name)
    setEmail(user.email)
    setPhone(user.phone)
    setAvatarUrl(user.avatar_url)
    setBio(user.bio)
    setAge(user.age)
    setFullAddress(user.full_address)
    setRelationshipStatus(user.relationship_status)
    setGender(user.gender)
    setPreferredLanguage(user.preferred_language || "en")
    setOpenAiToken("")
    setRemoveOpenAiToken(false)
  }, [user])

  const authTokenStored = getAuthToken()
  const loadingProfile = Boolean(authTokenStored) && user.id === ""

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    const ageResult = parseAgeInput(age)
    if (!ageResult.ok) {
      setFormError(tp("my_data.age_invalid"))
      return
    }

    if (!user.id) {
      setFormError(tp("my_data.profile_not_loaded"))
      return
    }

    setSubmitting(true)
    try {
      const patch: ApiUserUpdate = {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        avatar_url: avatarUrl.trim(),
        bio: bio.trim(),
        age: ageResult.value,
        full_address: fullAddress.trim(),
        relationship_status: relationshipStatus.trim(),
        gender: gender.trim(),
        preferred_language: preferredLanguage,
      }
      if (removeOpenAiToken) {
        patch.ai_token = ""
      } else if (openAiToken.trim()) {
        patch.ai_token = openAiToken.trim()
      }
      const updated = await patchUserApi(user.id, patch)
      const tok = getAuthToken()
      if (tok) {
        useSessionUserStore.getState().hydrateFromAuthMeResponse(tok, updated)
      }
    } catch (err) {
      setFormError(formErrorMessage(err, tp("my_data.form_error_fallback")))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppLayout
      title={tc("my_data_title")}
      breadcrumbs={[
        { label: tc("breadcrumb_dashboard"), to: "/dashboard" },
        { label: tc("my_data_title") },
      ]}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>{tc("my_data_title")}</CardTitle>
            <CardDescription>{tp("my_data.card_description")}</CardDescription>
          </CardHeader>
          {loadingProfile ? (
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {tp("my_data.loading_profile")}
              </p>
            </CardContent>
          ) : (
            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="flex flex-col gap-4"
            >
              <CardContent>
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
                    <FieldLabel htmlFor="profile-name">
                      {tp("my_data.full_name")}
                    </FieldLabel>
                    <Input
                      id="profile-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      required
                      disabled={submitting}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="profile-email">
                      {tp("my_data.email")}
                    </FieldLabel>
                    <Input
                      id="profile-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      required
                      disabled={submitting}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="profile-preferred-language">
                      {tp("my_data.preferred_language")}
                    </FieldLabel>
                    <Select
                      value={preferredLanguage}
                      onValueChange={setPreferredLanguage}
                      disabled={submitting}
                    >
                      <SelectTrigger
                        id="profile-preferred-language"
                        className="w-full"
                      >
                        <SelectValue
                          placeholder={tp("my_data.language_placeholder")}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="en">
                            {tp("my_data.lang_en")}
                          </SelectItem>
                          <SelectItem value="pt_br">
                            {tp("my_data.lang_pt_br")}
                          </SelectItem>
                          <SelectItem value="es">
                            {tp("my_data.lang_es")}
                          </SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FieldDescription>
                      {tp("my_data.preferred_language_hint")}
                    </FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="profile-openai-token">
                      {tp("my_data.openai_key")}
                    </FieldLabel>
                    <Input
                      id="profile-openai-token"
                      type="password"
                      autoComplete="off"
                      value={openAiToken}
                      onChange={(e) => {
                        setOpenAiToken(e.target.value)
                        setRemoveOpenAiToken(false)
                      }}
                      placeholder={
                        user.ai_token_configured
                          ? tp("my_data.placeholder_new_key")
                          : tp("my_data.placeholder_sk")
                      }
                      disabled={submitting || removeOpenAiToken}
                    />
                    <FieldDescription>
                      {tp("my_data.openai_desc")}
                      {user.ai_token_configured
                        ? tp("my_data.key_saved_suffix")
                        : ""}
                    </FieldDescription>
                    {user.ai_token_configured ? (
                      <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="size-4 rounded border-input"
                          checked={removeOpenAiToken}
                          onChange={(e) => {
                            setRemoveOpenAiToken(e.target.checked)
                            if (e.target.checked) setOpenAiToken("")
                          }}
                          disabled={submitting}
                        />
                        {tp("my_data.remove_key")}
                      </label>
                    ) : null}
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="profile-phone">
                      {tp("my_data.phone")}
                    </FieldLabel>
                    <Input
                      id="profile-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                      disabled={submitting}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="profile-avatar">
                      {tp("my_data.avatar_url")}
                    </FieldLabel>
                    <Input
                      id="profile-avatar"
                      type="url"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://"
                      disabled={submitting}
                    />
                    <FieldDescription>
                      {tp("my_data.avatar_hint")}
                    </FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="profile-bio">
                      {tp("my_data.bio")}
                    </FieldLabel>
                    <Textarea
                      id="profile-bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      placeholder={tp("my_data.bio_placeholder")}
                      disabled={submitting}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="profile-age">
                      {tp("my_data.age")}
                    </FieldLabel>
                    <Input
                      id="profile-age"
                      inputMode="numeric"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      autoComplete="off"
                      placeholder={tp("my_data.age_placeholder")}
                      disabled={submitting}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="profile-address">
                      {tp("my_data.full_address")}
                    </FieldLabel>
                    <Textarea
                      id="profile-address"
                      value={fullAddress}
                      onChange={(e) => setFullAddress(e.target.value)}
                      rows={3}
                      autoComplete="street-address"
                      placeholder={tp("my_data.address_placeholder")}
                      disabled={submitting}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="profile-relationship">
                      {tp("my_data.relationship_status")}
                    </FieldLabel>
                    <Input
                      id="profile-relationship"
                      value={relationshipStatus}
                      onChange={(e) => setRelationshipStatus(e.target.value)}
                      autoComplete="off"
                      disabled={submitting}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="profile-gender">
                      {tp("my_data.gender")}
                    </FieldLabel>
                    <Input
                      id="profile-gender"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      autoComplete="sex"
                      disabled={submitting}
                    />
                  </Field>
                </FieldGroup>
              </CardContent>
              <CardFooter className="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  disabled={submitting}
                >
                  {tp("shared.cancel")}
                </Button>
                <Button type="submit" disabled={submitting || loadingProfile}>
                  {submitting ? tp("shared.saving") : tp("shared.save_changes")}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      </div>
    </AppLayout>
  )
}
