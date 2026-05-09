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

export function AuthUiLanguageSelect() {
  const { t, i18n } = useTranslation(pagesI18nNs)
  const value = normalizeUiLanguage(i18n.language)

  function onValueChange(next: string) {
    const code = normalizeUiLanguage(next)
    persistGuestUiLanguage(code)
    void syncAppLanguageTo(code)
  }

  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-2.5">
      <Label
        htmlFor="auth-ui-lang"
        className="whitespace-nowrap text-sm text-muted-foreground"
      >
        {t("auth.ui_language")}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id="auth-ui-lang"
          size="sm"
          className="min-w-[11.5rem]"
          aria-label={t("auth.ui_language")}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {UI_LANGUAGE_CODES.map((code) => (
            <SelectItem key={code} value={code}>
              {NATIVE_LANGUAGE_LABELS[code]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
