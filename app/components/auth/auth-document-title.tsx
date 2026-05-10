"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"

import { pagesI18nNs } from "~/lib/i18n/config"

export type AuthDocumentTitleKey =
  | "auth.doc_title_login"
  | "auth.doc_title_register"
  | "auth.doc_title_recover"
  | "auth.doc_title_reset"

export function AuthDocumentTitle({
  titleKey,
}: {
  titleKey: AuthDocumentTitleKey
}) {
  const { t } = useTranslation(pagesI18nNs)
  React.useEffect(() => {
    document.title = `${t(titleKey)} · ${t("home.title")}`
  }, [t, titleKey])
  return null
}
