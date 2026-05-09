"use client"

import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router"
import { CookieIcon, XIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { landingI18nNs } from "~/lib/i18n/config"

const STORAGE_KEY = "hireest_cookie_consent"

export function LandingCookieBanner() {
  const { t } = useTranslation(landingI18nNs)

  const [mounted, setMounted] = useState(false)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setMounted(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true))
      })
    }
  }, [])

  function dismiss(value: "all" | "essential") {
    localStorage.setItem(STORAGE_KEY, value)
    setVisible(false)
    setTimeout(() => setMounted(false), 350)
  }

  if (!mounted) return null

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={t("cookie_banner.aria_label")}
      className={[
        "fixed inset-x-0 bottom-0 z-50 transition-transform duration-300 ease-out",
        visible ? "translate-y-0" : "translate-y-full",
      ].join(" ")}
    >
      {/* backdrop line */}
      <div className="border-t border-border/60 bg-background/95 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-x-6 sm:gap-y-2 sm:px-6 sm:py-3.5 lg:px-8">
          {/* icon + text — largura total no mobile */}
          <div className="flex min-w-0 w-full items-start gap-3 sm:flex-1 sm:items-center">
            <span className="mt-0.5 flex shrink-0 text-muted-foreground sm:mt-0">
              <CookieIcon className="size-4.5" />
            </span>
            <p className="min-w-0 flex-1 text-sm leading-snug text-muted-foreground">
              {t("cookie_banner.text")}{" "}
              <Link
                to="/privacy-policy"
                className="font-medium text-foreground underline underline-offset-4 hover:text-primary"
              >
                {t("cookie_banner.privacy_link")}
              </Link>
              .
            </p>
          </div>

          {/* actions — coluna no mobile (largura total), linha à direita no desktop */}
          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            <div className="flex w-full gap-2 sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => dismiss("essential")}
                className="h-9 flex-1 text-xs sm:h-8 sm:flex-initial"
              >
                {t("cookie_banner.essential_only")}
              </Button>
              <Button
                size="sm"
                onClick={() => dismiss("all")}
                className="h-9 flex-1 text-xs sm:h-8 sm:flex-initial"
              >
                {t("cookie_banner.accept")}
              </Button>
            </div>
            <div className="flex justify-end sm:contents">
              <button
                type="button"
                aria-label={t("cookie_banner.close_aria")}
                onClick={() => dismiss("essential")}
                className="flex size-9 items-center justify-center rounded-md text-muted-foreground/70 transition-colors hover:bg-muted hover:text-foreground sm:ml-1 sm:size-7"
              >
                <XIcon className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
