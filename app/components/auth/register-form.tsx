"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { GoogleAuthProvider, signInWithPopup, type User } from "firebase/auth"
import { Link, useNavigate } from "react-router"

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { AuthLegalLinks } from "~/components/auth/auth-legal-links"
import { ApiError } from "~/lib/api/errors"
import { registerWithEmail } from "~/lib/api/resources/auth"
import { setAuthToken } from "~/lib/auth-token"
import { firebaseAuthErrorMessage } from "~/lib/firebase-auth"
import { syncFirebaseUserToApiSession } from "~/lib/firebase-auth-session"
import { firebaseAuth } from "~/lib/firebase.client"
import { markPendingRegistrationOnboarding } from "~/lib/registration-onboarding-session"
import { useSessionUserStore } from "~/stores/session-user-store"
import { pagesI18nNs } from "~/lib/i18n/config"

function messagesFor(
  errors: Record<string, string[]>,
  key: string
): string | undefined {
  const m = errors[key]
  return m?.length ? m.join(" ") : undefined
}

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { t } = useTranslation(pagesI18nNs)
  const navigate = useNavigate()

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [passwordConfirmation, setPasswordConfirmation] = React.useState("")
  const [acceptedPolicies, setAcceptedPolicies] = React.useState(false)
  const [pending, setPending] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = React.useState<
    Record<string, string[]>
  >({})

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    void submitRegister()
  }

  const completeAuthSession = React.useCallback(
    async (user: User) => {
      await syncFirebaseUserToApiSession(user)
      const sessionUser = useSessionUserStore.getState().user
      if (!sessionUser.ai_token_configured) {
        markPendingRegistrationOnboarding()
        navigate("/onboarding", { replace: true })
      } else {
        navigate("/dashboard", { replace: true })
      }
    },
    [navigate]
  )

  async function submitRegister() {
    setFormError(null)
    setFieldErrors({})

    if (!acceptedPolicies) {
      setFormError(t("auth.accept_policy_required"))
      return
    }

    if (password !== passwordConfirmation) {
      setFieldErrors({
        password_confirmation: [t("auth.password_mismatch")],
      })
      return
    }

    setPending(true)
    try {
      const session = await registerWithEmail({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirmation,
      })
      setAuthToken(session.token)
      useSessionUserStore
        .getState()
        .hydrateFromAuthMeResponse(session.token, session.user)
      if (!session.user.ai_token_configured) {
        markPendingRegistrationOnboarding()
        navigate("/onboarding", { replace: true })
      } else {
        navigate("/dashboard", { replace: true })
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.fieldErrors)
        const baseMsg = err.fieldErrors.base?.join(". ")
        setFormError(baseMsg ?? null)
        return
      }
      if (err instanceof TypeError) {
        setFormError(t("auth.network_error"))
        return
      }
      setFormError(t("auth.account_create_failed"))
    } finally {
      setPending(false)
    }
  }

  async function signUpWithGooglePopup() {
    setFormError(null)
    if (!acceptedPolicies) {
      setFormError(t("auth.accept_policy_required"))
      return
    }
    setPending(true)
    try {
      const credential = await signInWithPopup(
        firebaseAuth,
        new GoogleAuthProvider()
      )
      await completeAuthSession(credential.user)
    } catch (error) {
      setFormError(firebaseAuthErrorMessage(error))
    } finally {
      setPending(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("auth.register_title")}</CardTitle>
          <CardDescription>{t("auth.register_subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form method="post" onSubmit={handleSubmit}>
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
                <div className="flex gap-3">
                  <Checkbox
                    id="register-accept-policies"
                    checked={acceptedPolicies}
                    onCheckedChange={(value) => {
                      const next = value === true
                      setAcceptedPolicies(next)
                      if (next) setFormError(null)
                    }}
                    disabled={pending}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor="register-accept-policies"
                    className="cursor-pointer leading-snug font-normal text-muted-foreground"
                  >
                    {t("auth.accept_register_label")}
                  </Label>
                </div>
                {!acceptedPolicies ? (
                  <FieldDescription>
                    {t("auth.accept_policy_hint")}
                  </FieldDescription>
                ) : null}
              </Field>
              <Field>
                <Button
                  variant="outline"
                  type="button"
                  disabled={pending}
                  onClick={() => void signUpWithGooglePopup()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  {t("auth.register_google")}
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                {t("auth.separator_or_email")}
              </FieldSeparator>
              <Field>
                <FieldLabel htmlFor="register-name">
                  {t("shared.name")}
                </FieldLabel>
                <Input
                  id="register-name"
                  type="text"
                  placeholder={t("auth.name_placeholder")}
                  autoComplete="name"
                  required
                  value={name}
                  onChange={(ev) => setName(ev.target.value)}
                  disabled={pending}
                  aria-invalid={Boolean(messagesFor(fieldErrors, "name"))}
                />
                {messagesFor(fieldErrors, "name") ? (
                  <FieldDescription className="text-destructive">
                    {messagesFor(fieldErrors, "name")}
                  </FieldDescription>
                ) : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="register-email">
                  {t("shared.email")}
                </FieldLabel>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  disabled={pending}
                  aria-invalid={Boolean(messagesFor(fieldErrors, "email"))}
                />
                {messagesFor(fieldErrors, "email") ? (
                  <FieldDescription className="text-destructive">
                    {messagesFor(fieldErrors, "email")}
                  </FieldDescription>
                ) : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="register-password">
                  {t("shared.password")}
                </FieldLabel>
                <Input
                  id="register-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  disabled={pending}
                  aria-invalid={Boolean(messagesFor(fieldErrors, "password"))}
                />
                {messagesFor(fieldErrors, "password") ? (
                  <FieldDescription className="text-destructive">
                    {messagesFor(fieldErrors, "password")}
                  </FieldDescription>
                ) : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="register-password-confirm">
                  {t("shared.confirm_password")}
                </FieldLabel>
                <Input
                  id="register-password-confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={passwordConfirmation}
                  onChange={(ev) => setPasswordConfirmation(ev.target.value)}
                  disabled={pending}
                  aria-invalid={Boolean(
                    messagesFor(fieldErrors, "password_confirmation")
                  )}
                />
                {messagesFor(fieldErrors, "password_confirmation") ? (
                  <FieldDescription className="text-destructive">
                    {messagesFor(fieldErrors, "password_confirmation")}
                  </FieldDescription>
                ) : null}
              </Field>
              <Field>
                <Button type="submit" disabled={pending || !acceptedPolicies}>
                  {pending
                    ? t("auth.creating_account")
                    : t("auth.create_account")}
                </Button>
                <FieldDescription className="text-center">
                  {t("auth.has_account")}{" "}
                  <Link
                    to="/login"
                    className="underline-offset-4 hover:underline"
                  >
                    {t("auth.sign_in")}
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <AuthLegalLinks />
    </div>
  )
}
