"use client"

import { useTranslation } from "react-i18next"
import { Link } from "react-router"
import { GalleryVerticalEndIcon } from "lucide-react"
import { pagesI18nNs } from "~/lib/i18n/config"

export function AuthPageShell({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation(pagesI18nNs)
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GalleryVerticalEndIcon className="size-4" />
          </div>
          {t("home.title")}
        </Link>
        {children}
      </div>
    </div>
  )
}
