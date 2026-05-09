import { AuthDocumentTitle } from "~/components/auth/auth-document-title"
import { AuthPageShell } from "~/components/auth/auth-page-shell"
import { RecoverPasswordForm } from "~/components/auth/recover-password-form"

export default function RecoverPasswordPage() {
  return (
    <AuthPageShell>
      <AuthDocumentTitle titleKey="auth.doc_title_recover" />
      <RecoverPasswordForm />
    </AuthPageShell>
  )
}
