import { parseUiLangFromCookieHeader } from "~/lib/i18n/cookie"
import {
  acceptLanguageToUi,
  type UiLanguageCode,
} from "~/lib/i18n/preferred-language"

/**
 * Mesma regra do `loader` da raiz: cookie do layout, ou cabeçalho Accept-Language.
 * Usado no SSR para alinhar i18next ao HTML antes do render.
 */
export function resolveRequestUiLanguage(request: Request): UiLanguageCode {
  const cookieLang = parseUiLangFromCookieHeader(request.headers.get("Cookie"))
  return (
    cookieLang ?? acceptLanguageToUi(request.headers.get("Accept-Language"))
  )
}
