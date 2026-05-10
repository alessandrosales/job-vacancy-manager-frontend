/** Após login: onboarding só abre uma vez por sessão do navegador; limpo no logout. */
export const OPENAI_ONBOARDING_AFTER_LOGIN_SESSION_KEY =
  "job-vacancy-openai-onboarding-after-login:v1"

export function markOpenAiOnboardingHandledThisSession(): void {
  try {
    sessionStorage.setItem(OPENAI_ONBOARDING_AFTER_LOGIN_SESSION_KEY, "1")
  } catch {
    /* ignore */
  }
}

export function shouldAutoOpenOpenAiOnboardingThisSession(): boolean {
  try {
    return (
      sessionStorage.getItem(OPENAI_ONBOARDING_AFTER_LOGIN_SESSION_KEY) !== "1"
    )
  } catch {
    return true
  }
}

export function clearOpenAiOnboardingSessionFlag(): void {
  try {
    sessionStorage.removeItem(OPENAI_ONBOARDING_AFTER_LOGIN_SESSION_KEY)
  } catch {
    /* ignore */
  }
}
