"use client"

import * as React from "react"
import { useTranslation } from "react-i18next"
import { MoonIcon, SunIcon } from "lucide-react"

import { Button } from "~/components/ui/button"
import { applyTheme, getStoredTheme, type ThemeMode } from "~/lib/theme"
import { defaultI18nNs } from "~/lib/i18n/config"

/**
 * Alterna claro/escuro na landing (mesma persistência do app autenticado).
 */
export function LandingThemeToggle() {
  const { t } = useTranslation(defaultI18nNs)
  const [mode, setMode] = React.useState<ThemeMode>("dark")

  React.useEffect(() => {
    const stored = getStoredTheme()
    if (stored === "dark" || stored === "light") {
      setMode(stored)
      return
    }
    setMode(
      document.documentElement.classList.contains("dark") ? "dark" : "light"
    )
  }, [])

  function toggle() {
    const next: ThemeMode = mode === "dark" ? "light" : "dark"
    applyTheme(next)
    setMode(next)
  }

  const isDark = mode === "dark"
  const label = t("nav_dark_mode")

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggle}
      aria-label={label}
      aria-pressed={isDark}
    >
      {isDark ? (
        <SunIcon data-icon="inline-start" />
      ) : (
        <MoonIcon data-icon="inline-start" />
      )}
    </Button>
  )
}
