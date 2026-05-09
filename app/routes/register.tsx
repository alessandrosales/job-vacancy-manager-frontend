import { AuthDocumentTitle } from "~/components/auth/auth-document-title"
import { AuthPageShell } from "~/components/auth/auth-page-shell"
import { RegisterForm } from "~/components/auth/register-form"

export default function RegisterPage() {
  return (
    <AuthPageShell>
      <AuthDocumentTitle titleKey="auth.doc_title_register" />
      <RegisterForm />
    </AuthPageShell>
  )
}
