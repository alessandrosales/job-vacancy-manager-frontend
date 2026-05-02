"use client"

import * as React from "react"
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
import { registerWithEmail } from "~/lib/api/resources/auth"
import { setAuthToken } from "~/lib/auth-token"
import { useSessionUserStore } from "~/stores/session-user-store"

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

  async function submitRegister() {
    setFormError(null)
    setFieldErrors({})

    if (password !== passwordConfirmation) {
      setFieldErrors({
        password_confirmation: ["não coincide com Senha"],
      })
      return
    }

    setPending(true)
    try {
      const data = await registerWithEmail({
        name: name.trim(),
        email: email.trim(),
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
          <CardTitle className="text-xl">Criar conta</CardTitle>
          <CardDescription>
            Cadastre-se com Apple, Google ou e-mail
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
                <Button variant="outline" type="button" disabled={pending}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  Continuar com Apple
                </Button>
                <Button variant="outline" type="button" disabled={pending}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Continuar com Google
                </Button>
              </Field>
              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Ou continue com
              </FieldSeparator>
              <Field>
                <FieldLabel htmlFor="register-name">Nome</FieldLabel>
                <Input
                  id="register-name"
                  type="text"
                  placeholder="Seu nome"
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
                <FieldLabel htmlFor="register-email">E-mail</FieldLabel>
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
                <FieldLabel htmlFor="register-password">Senha</FieldLabel>
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
                  Confirmar senha
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
                  {pending ? "Cadastrando…" : "Cadastrar"}
                </Button>
                <FieldDescription className="text-center">
                  Já tem uma conta?{" "}
                  <Link
                    to="/"
                    className="underline-offset-4 hover:underline"
                  >
                    Entrar
                  </Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        Ao continuar, você concorda com os{" "}
        <a href="#" className="underline-offset-4 hover:underline">
          Termos de uso
        </a>{" "}
        e a{" "}
        <a href="#" className="underline-offset-4 hover:underline">
          Política de privacidade
        </a>
        .
      </FieldDescription>
    </div>
  )
}
