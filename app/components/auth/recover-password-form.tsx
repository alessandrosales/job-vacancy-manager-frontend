"use client"

import * as React from "react"
import { Link } from "react-router"

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
import { recoverPassword } from "~/lib/api/resources/passwords"

export function RecoverPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [formError, setFormError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    e.stopPropagation()
    void submitRecover()
  }

  async function submitRecover() {
    setFormError(null)
    setSuccess(false)

    setPending(true)
    try {
      await recoverPassword(email.trim())
      setSuccess(true)
    } catch (err) {
      if (err instanceof ApiError) {
        const baseMsg = err.fieldErrors.base?.join(". ")
        setFormError(
          baseMsg ??
            "Não foi possível enviar o pedido. Tente novamente em instantes."
        )
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
          <CardTitle className="text-xl">Recuperar senha</CardTitle>
          <CardDescription>
            Digite seu e-mail e enviaremos um link para redefinir a senha.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form method="post" onSubmit={handleSubmit}>
            <FieldGroup>
              {success ? (
                <Field>
                  <p
                    role="status"
                    className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400"
                  >
                    Se existir uma conta com este e-mail, você receberá em breve
                    as instruções para redefinir a senha.
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
                <FieldLabel htmlFor="recover-email">E-mail</FieldLabel>
                <Input
                  id="recover-email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(ev) => setEmail(ev.target.value)}
                  disabled={pending || success}
                  aria-invalid={Boolean(formError)}
                />
              </Field>
              <Field>
                <Button type="submit" disabled={pending || success}>
                  {pending ? "Enviando…" : "Enviar link"}
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
      <FieldDescription className="px-6 text-center text-balance">
        O e-mail pode levar alguns minutos. Verifique também a pasta de spam.
      </FieldDescription>
    </div>
  )
}
