"use client"

import { useTranslation } from "react-i18next"
import { Link } from "react-router"
import { pagesI18nNs } from "~/lib/i18n/config"

export function AuthPageShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation(pagesI18nNs)
  const title = t("home.title")
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          to="/"
          className="flex justify-center self-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <img
            src="/logo-bg-light.png"
            alt={title}
            className="h-11 w-auto max-w-[min(100%,260px)] object-contain dark:hidden"
          />
          <img
            src="/logo-bg-dark.png"
            alt=""
            aria-hidden
            className="hidden h-11 w-auto max-w-[min(100%,260px)] object-contain dark:block"
          />
        </Link>
        {children}
      </div>
    </div>
  )
}
