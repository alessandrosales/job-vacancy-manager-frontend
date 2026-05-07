"use client"

import * as React from "react"
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  type User,
} from "firebase/auth"
import { Link, useNavigate } from "react-router"

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
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
import { firebaseAuthErrorMessage } from "~/lib/firebase-auth"
import { syncFirebaseUserToApiSession } from "~/lib/firebase-auth-session"
import { firebaseAuth } from "~/lib/firebase.client"

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
  const navigate = useNavigate()

  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [passwordConfirmation, setPasswordConfirmation] = React.useState("")
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
      navigate("/dashboard", { replace: true })
    },
    [navigate]
  )

  async function submitRegister() {
    setFormError(null)
    setFieldErrors({})

    if (password !== passwordConfirmation) {
      setFieldErrors({
        password_confirmation: ["doesn't match Password"],
      })
      return
    }

    setPending(true)
    try {
      const credential = await createUserWithEmailAndPassword(
        firebaseAuth,
        email.trim(),
        password
      )
      if (name.trim()) {
        await updateProfile(credential.user, { displayName: name.trim() })
      }
      await completeAuthSession(credential.user)
    } catch (error) {
      setFormError(firebaseAuthErrorMessage(error))
    } finally {
      setPending(false)
    }
  }

  async function signUpWithGooglePopup() {
    setFormError(null)
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
          <CardTitle className="text-xl">Create account</CardTitle>
          <CardDescription>
            Sign up with Google or email
          </CardDescription>
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
                  Continue with Google
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field>
                <FieldLabel htmlFor="register-name">Name</FieldLabel>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="Your name"
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
                <FieldLabel htmlFor="register-email">Email</FieldLabel>
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
                <FieldLabel htmlFor="register-password">Password</FieldLabel>
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
                  Confirm password
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
                <Button type="submit" disabled={pending}>
                  {pending ? "Creating account…" : "Create account"}
                </Button>
                <FieldDescription className="text-center">
                  Already have an account?{" "}
                  <Link
                    to="/"
                    className="underline-offset-4 hover:underline"
                  >
                    Sign in
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By continuing, you agree to our{" "}
        <a href="#" className="underline-offset-4 hover:underline">
          Terms of use
        </a>{" "}
        and{" "}
        <a href="#" className="underline-offset-4 hover:underline">
          Privacy policy
        </a>
        .
      </FieldDescription>
    </div>
  )
}
