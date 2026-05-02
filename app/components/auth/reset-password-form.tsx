"use client"

import * as React from "react"
import { Link, useNavigate, useSearchParams } from "react-router"

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
} from "~/components/ui/field"
import { Input } from "~/components/ui/input"
import { ApiError } from "~/lib/api/errors"
import { changePasswordWithToken } from "~/lib/api/resources/passwords"
import { setAuthToken } from "~/lib/auth-token"
import { useSessionUserStore } from "~/stores/session-user-store"

function messagesFor(
  errors: Record<string, string[]>,
  key: string
): string | undefined {
  const m = errors[key]
  return m?.length ? m.join(" ") : undefined
}

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const reset_token = searchParams.get("reset_token")?.trim() ?? ""

  const [password, setPassword] = React.useState("")
  const [passwordConfirmation, setPasswordConfirmation] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = React.useState<
    Record<string, string[]>
  >({})

  const tokenMissing = reset_token === ""

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    void submitReset()
  }

  async function submitReset() {
    setFormError(null)
    setFieldErrors({})

    if (tokenMissing) {
      setFormError("Link inválido ou incompleto. Solicite um novo e-mail de recuperação.")
      return
    }

    if (password !== passwordConfirmation) {
      setFieldErrors({
        password_confirmation: ["não coincide com Senha"],
      })
      return
    }

    setPending(true)
    try {
      const data = await changePasswordWithToken({
        reset_token,
        password,
        password_confirmation: passwordConfirmation,
      })
      setAuthToken(data.token)
      useSessionUserStore
        .getState()
        .hydrateFromAuthMeResponse(data.token, data.user)
      navigate("/dashboard", { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setFieldErrors(err.fieldErrors)
        const baseMsg = err.fieldErrors.base?.join(". ")
        setFormError(baseMsg ?? null)
        return
      }
      setFormError(
        "Não foi possível conectar. Verifique sua rede e se a API está disponível (URL base em VITE_API_BASE_URL)."
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Nova senha</CardTitle>
          <CardDescription>
            Escolha uma nova senha para a sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form method="post" onSubmit={handleSubmit}>
            <FieldGroup>
              {tokenMissing ? (
                <Field>
                  <p
                    role="alert"
                    className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                  >
                    Este link não contém um token válido.{" "}
                    <Link
                      to="/recover-password"
                      className="font-medium underline underline-offset-4"
                    >
                      Pedir novo link
                    </Link>
                    .
                  </p>
                </Field>
              ) : null}
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
                <FieldLabel htmlFor="reset-password">Nova senha</FieldLabel>
                <Input
                  id="reset-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(ev) => setPassword(ev.target.value)}
                  disabled={pending || tokenMissing}
                  aria-invalid={Boolean(messagesFor(fieldErrors, "password"))}
                />
                {messagesFor(fieldErrors, "password") ? (
                  <FieldDescription className="text-destructive">
                    {messagesFor(fieldErrors, "password")}
                  </FieldDescription>
                ) : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="reset-password-confirm">
                  Confirmar senha
                </FieldLabel>
                <Input
                  id="reset-password-confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={passwordConfirmation}
                  onChange={(ev) => setPasswordConfirmation(ev.target.value)}
                  disabled={pending || tokenMissing}
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
              {messagesFor(fieldErrors, "reset_token") ? (
                <Field>
                  <FieldDescription className="text-destructive">
                    {messagesFor(fieldErrors, "reset_token")}
                  </FieldDescription>
                </Field>
              ) : null}
              <Field>
                <Button type="submit" disabled={pending || tokenMissing}>
                  {pending ? "Salvando…" : "Salvar nova senha"}
                </Button>
                <FieldDescription className="text-center">
                  <Link
                    to="/"
                    className="underline-offset-4 hover:underline"
                  >
                    Voltar ao login
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        O link expira após algumas horas. Se precisar, solicite outro em{" "}
        <Link to="/recover-password" className="underline-offset-4 hover:underline">
          recuperar senha
        </Link>
        .
      </FieldDescription>
    </div>
  )
}
