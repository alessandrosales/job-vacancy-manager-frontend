import { AuthDocumentTitle } from "~/components/auth/auth-document-title"
import { AuthPageShell } from "~/components/auth/auth-page-shell"
import { LoginForm } from "~/components/auth/login-form"

export default function LoginPage() {
  return (
    <AuthPageShell>
      <AuthDocumentTitle titleKey="auth.doc_title_login" />
      <LoginForm />
    </AuthPageShell>
  )
}
