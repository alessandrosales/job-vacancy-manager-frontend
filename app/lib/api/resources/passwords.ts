import { apiRequestJson, apiRequestNoContent } from "~/lib/api/client"
import {
  parseAuthSessionPayload,
  type AuthSessionPayload,
} from "~/lib/api/resources/auth"

/** Solicita e-mail de recuperação (`204`, sem corpo). */
export async function recoverPassword(email: string): Promise<void> {
  await apiRequestNoContent({
    path: "auth/recover-password",
    method: "POST",
    auth: false,
    body: {
      auth: {
        email: email.trim(),
      },
    },
  })
}

/** Redefine senha com token recebido por e-mail; devolve novo JWT. */
export async function changePasswordWithToken(params: {
  reset_token: string
  password: string
  password_confirmation: string
}): Promise<AuthSessionPayload> {
  const data = await apiRequestJson<unknown>({
    path: "auth/change-password",
    method: "POST",
    auth: false,
    body: {
      auth: {
        reset_token: params.reset_token,
        password: params.password,
        password_confirmation: params.password_confirmation,
      },
    },
  })
  return parseAuthSessionPayload(data)
}
