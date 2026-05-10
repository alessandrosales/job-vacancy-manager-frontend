import { parseUiLangFromCookieHeader } from "~/lib/i18n/cookie"
import {
  acceptLanguageToUi,
  type UiLanguageCode,
} from "~/lib/i18n/preferred-language"

function pathnameIsLandingIndex(request: Request): boolean {
  const pathname = new URL(request.url).pathname
  return pathname === "/" || pathname === ""
}

/**
 * Mesma regra do `loader` da raiz: cookie do layout; na landing (`/`) sem cookie,
 * inglês por padrão; nas demais rotas, cabeçalho Accept-Language.
 * Usado no SSR para alinhar i18next ao HTML antes do render.
 */
export function resolveRequestUiLanguage(request: Request): UiLanguageCode {
  const cookieLang = parseUiLangFromCookieHeader(request.headers.get("Cookie"))
  if (cookieLang) return cookieLang
  if (pathnameIsLandingIndex(request)) return "en"
  return acceptLanguageToUi(request.headers.get("Accept-Language"))
}
