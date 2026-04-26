import { AuthPageShell } from "~/components/auth/auth-page-shell"
import { RecoverPasswordForm } from "~/components/auth/recover-password-form"

export default function RecoverPasswordPage() {
  return (
    <AuthPageShell>
      <RecoverPasswordForm />
    </AuthPageShell>
  )
}
