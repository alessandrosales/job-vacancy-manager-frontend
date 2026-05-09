/** Cookie apenas UX para alinhar SSR com o idioma ativo (`Path=/`, `SameSite=Lax`). */
export const UI_LANG_COOKIE_NAME = "job_vacancy_ui_lang"

export const UI_LANG_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

/** Preferência local para rotas não autenticadas (separado do Rails). */
export const GUEST_UI_LANG_STORAGE_KEY = "job-vacancy-ui-lang-guest-v1"
