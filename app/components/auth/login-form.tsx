"use client"

import * as React from "react"
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
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
import { ApiError } from "~/lib/api/errors"
import { loginWithEmail } from "~/lib/api/resources/auth"
import { setAuthToken } from "~/lib/auth-token"
import {
  firebaseAuthErrorMessage,
  firebaseCredentialErrorMayRetryWithApi,
} from "~/lib/firebase-auth"
import { syncFirebaseUserToApiSession } from "~/lib/firebase-auth-session"
import { firebaseAuth } from "~/lib/firebase.client"
import { useSessionUserStore } from "~/stores/session-user-store"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()

  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    void submitLogin()
  }

  const completeAuthSession = React.useCallback(
    async (user: User) => {
      await syncFirebaseUserToApiSession(user)
      navigate("/dashboard", { replace: true })
    },
    [navigate]
  )

  async function submitLogin() {
    setFormError(null)

    setPending(true)
    try {
      try {
        const credential = await signInWithEmailAndPassword(
          firebaseAuth,
          email.trim(),
          password
        )
        await completeAuthSession(credential.user)
      } catch (firebaseErr) {
        if (!firebaseCredentialErrorMayRetryWithApi(firebaseErr)) {
          setFormError(firebaseAuthErrorMessage(firebaseErr))
          return
        }
        try {
          const session = await loginWithEmail({
            email: email.trim(),
            password,
          })
          setAuthToken(session.token)
          useSessionUserStore
            .getState()
            .hydrateFromAuthMeResponse(session.token, session.user)
          navigate("/dashboard", { replace: true })
        } catch (apiErr) {
          if (apiErr instanceof ApiError) {
            const parts = Object.values(apiErr.fieldErrors)
              .flat()
              .filter(Boolean)
            setFormError(
              parts.length > 0
                ? parts.join(" ")
                : "Invalid email or password."
            )
            return
          }
          if (apiErr instanceof TypeError) {
            setFormError(
              "Could not reach the API. Check your network and VITE_API_BASE_URL."
            )
            return
          }
          setFormError(firebaseAuthErrorMessage(firebaseErr))
        }
      }
    } finally {
      setPending(false)
    }
  }

  async function signInWithGooglePopup() {
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
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in with Google or email
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
                  onClick={() => void signInWithGooglePopup()}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Sign in with Google
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  disabled={pending}
                  aria-invalid={Boolean(formError)}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    to="/recover-password"
                    className="ms-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  disabled={pending}
                  aria-invalid={Boolean(formError)}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={pending}>
                  {pending ? "Signing in…" : "Sign in"}
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account?{" "}
                  <Link
                    to="/register"
                    className="underline-offset-4 hover:underline"
                  >
                    Sign up
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
