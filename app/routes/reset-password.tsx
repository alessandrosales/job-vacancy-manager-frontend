import { AuthDocumentTitle } from "~/components/auth/auth-document-title"
import { AuthPageShell } from "~/components/auth/auth-page-shell"
import { ResetPasswordForm } from "~/components/auth/reset-password-form"

export default function ResetPasswordPage() {
  return (
    <AuthPageShell>
      <AuthDocumentTitle titleKey="auth.doc_title_reset" />
      <ResetPasswordForm />
    </AuthPageShell>
  )
}
