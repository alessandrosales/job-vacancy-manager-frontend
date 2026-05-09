"use client"

import { useTranslation } from "react-i18next"
import { Link } from "react-router"

import { FieldDescription } from "~/components/ui/field"
import { pagesI18nNs } from "~/lib/i18n/config"

/** Bloco “Ao continuar…” com links para Termos e Privacidade (login e registro). */
export function AuthLegalLinks() {
  const { t } = useTranslation(pagesI18nNs)
  return (
    <FieldDescription className="max-w-md px-6 text-center text-pretty text-muted-foreground">
      {t("auth.legal_prefix")}{" "}
      <Link
        to="/terms-of-use"
        className="text-foreground underline underline-offset-4 hover:underline"
      >
        {t("auth.terms")}
      </Link>{" "}
      {t("auth.legal_and")}{" "}
      <Link
        to="/privacy-policy"
        className="text-foreground underline underline-offset-4 hover:underline"
      >
        {t("auth.privacy")}
      </Link>
      .
    </FieldDescription>
  )
}
