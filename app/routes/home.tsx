"use client"

import { Link } from "react-router"
import { useTranslation } from "react-i18next"

import { Button } from "~/components/ui/button"
import { pagesI18nNs } from "~/lib/i18n/config"

export default function Home() {
  const { t } = useTranslation(pagesI18nNs)

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="flex max-w-md min-w-0 flex-col gap-6 text-center text-sm leading-loose">
        <div className="flex flex-col gap-2">
          <h1 className="text-lg font-medium">{t("home.title")}</h1>
          <p className="text-muted-foreground">{t("home.subtitle")}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
          <Button asChild variant="outline">
            <Link to="/">{t("home.login")}</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link to="/register">{t("home.register")}</Link>
          </Button>
          <Button asChild>
            <Link to="/dashboard">{t("home.dashboard")}</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
