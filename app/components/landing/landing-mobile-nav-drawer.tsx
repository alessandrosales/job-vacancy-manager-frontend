"use client"

import { Link } from "react-router"
import { MenuIcon, XIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

import { AuthUiLanguageSelect } from "~/components/auth/auth-ui-language-select"
import { LandingThemeToggle } from "~/components/landing/landing-theme-toggle"
import { Button } from "~/components/ui/button"
import { Separator } from "~/components/ui/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet"
import { landingI18nNs, pagesI18nNs } from "~/lib/i18n/config"

export function LandingMobileNavDrawer() {
  const { t } = useTranslation(landingI18nNs)
  const { t: tp } = useTranslation(pagesI18nNs)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0"
          aria-label={t("nav.menu_open_aria")}
          aria-haspopup="dialog"
        >
          <MenuIcon className="size-4" />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="flex h-full w-full max-w-[min(100vw,20rem)] flex-col gap-0 border-s p-0 sm:max-w-sm"
      >
        <div className="relative flex items-center border-b border-border px-4 py-3 pe-14">
          <SheetTitle className="font-heading text-base font-medium">
            {t("nav.menu_title")}
          </SheetTitle>
          <SheetClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute end-3 top-2.5"
              aria-label={t("nav.menu_close_aria")}
            >
              <XIcon className="size-4" />
            </Button>
          </SheetClose>
        </div>

        <div className="flex flex-col gap-6 overflow-y-auto px-4 py-6">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {tp("auth.ui_language")}
            </span>
            <AuthUiLanguageSelect
              compact
              triggerSize="default"
              menuAlign="start"
              triggerClassName="w-full min-w-0 max-w-none justify-between"
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-foreground">
              {t("nav.theme_label")}
            </span>
            <LandingThemeToggle />
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <SheetClose asChild>
              <Button variant="outline" className="w-full justify-center" asChild>
                <Link to="/login">{t("nav.sign_in")}</Link>
              </Button>
            </SheetClose>
            <SheetClose asChild>
              <Button className="w-full justify-center" asChild>
                <Link to="/register">{t("nav.start_free")}</Link>
              </Button>
            </SheetClose>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
