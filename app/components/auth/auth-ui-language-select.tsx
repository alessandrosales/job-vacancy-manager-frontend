"use client"

import { useTranslation } from "react-i18next"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Label } from "~/components/ui/label"
import { cn } from "~/lib/utils"
import { syncAppLanguageTo, pagesI18nNs } from "~/lib/i18n/config"
import { persistGuestUiLanguage } from "~/lib/i18n/guest-ui-lang-storage"
import {
  type UiLanguageCode,
  UI_LANGUAGE_CODES,
  normalizeUiLanguage,
} from "~/lib/i18n/preferred-language"

const NATIVE_LANGUAGE_LABELS: Record<UiLanguageCode, string> = {
  en: "English",
  pt_br: "Português (Brasil)",
  es: "Español",
}

export function AuthUiLanguageSelect({
  compact = false,
  triggerClassName,
  triggerSize = "sm",
  menuAlign = "center",
  onLanguageCommitted,
}: {
  /** Header / marketing: só o select, sem label visível. */
  compact?: boolean
  /** Classes extras no trigger (ex.: `max-w-*` no header apertado). */
  triggerClassName?: string
  /** `default` (h-8) alinha com botões do header; `sm` (h-7) nos formulários de auth. */
  triggerSize?: "sm" | "default"
  /** Alinhamento do painel do select (útil no header à direita). */
  menuAlign?: "start" | "center" | "end"
  /** Depois de persistir idioma da UI e sincronizar i18n (ex.: salvar `preferred_language` no perfil). */
  onLanguageCommitted?: (code: UiLanguageCode) => void | Promise<void>
}) {
  const { t, i18n } = useTranslation(pagesI18nNs)
  const value = normalizeUiLanguage(i18n.language)

  function onValueChange(next: string) {
    const code = normalizeUiLanguage(next)
    persistGuestUiLanguage(code)
    void (async () => {
      await syncAppLanguageTo(code)
      await onLanguageCommitted?.(code)
    })()
  }

  const select = (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        id="auth-ui-lang"
        size={triggerSize}
        className={cn(
          compact ? "min-w-[10.5rem]" : "min-w-[11.5rem]",
          triggerClassName
        )}
        aria-label={t("auth.ui_language")}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align={menuAlign} collisionPadding={12}>
        {UI_LANGUAGE_CODES.map((code) => (
          <SelectItem key={code} value={code}>
            {NATIVE_LANGUAGE_LABELS[code]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )

  if (compact) {
    return <div className="flex shrink-0 items-center">{select}</div>
  }

  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-2.5">
      <Label
        htmlFor="auth-ui-lang"
        className="text-sm whitespace-nowrap text-muted-foreground"
      >
        {t("auth.ui_language")}
      </Label>
      {select}
    </div>
  )
}
