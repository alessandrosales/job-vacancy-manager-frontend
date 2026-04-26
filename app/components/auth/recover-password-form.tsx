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

export function RecoverPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
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
          <form>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="recover-email">E-mail</FieldLabel>
                <Input
                  id="recover-email"
                  type="email"
                  placeholder="m@example.com"
                  autoComplete="email"
                  required
                />
              </Field>
              <Field>
                <Button type="submit">Enviar link</Button>
                <FieldDescription className="text-center">
                  <Link
                    to="/login"
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
