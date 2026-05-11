/** Wizard bloqueante pós-cadastro; limpo ao concluir ou no logout. */

export const REGISTRATION_ONBOARDING_PENDING_KEY =
  "hireest-pending-registration-onboarding:v1"

export const REGISTRATION_ONBOARDING_STEP_KEY =
  "hireest-registration-onboarding-step:v1"

const MIN_STEP = 1
const MAX_STEP = 5

export function markPendingRegistrationOnboarding(): void {
  try {
    sessionStorage.setItem(REGISTRATION_ONBOARDING_PENDING_KEY, "1")
    sessionStorage.setItem(REGISTRATION_ONBOARDING_STEP_KEY, String(MIN_STEP))
  } catch {
    /* ignore */
  }
}

export function isPendingRegistrationOnboarding(): boolean {
  try {
    return sessionStorage.getItem(REGISTRATION_ONBOARDING_PENDING_KEY) === "1"
  } catch {
    return false
  }
}

export function getRegistrationOnboardingStep(): number {
  try {
    const raw = sessionStorage.getItem(REGISTRATION_ONBOARDING_STEP_KEY)
    const n = raw ? Number.parseInt(raw, 10) : MIN_STEP
    if (!Number.isFinite(n) || n < MIN_STEP || n > MAX_STEP) return MIN_STEP
    return n
  } catch {
    return MIN_STEP
  }
}

export function setRegistrationOnboardingStep(step: number): void {
  try {
    const clamped = Math.min(MAX_STEP, Math.max(MIN_STEP, Math.floor(step)))
    sessionStorage.setItem(REGISTRATION_ONBOARDING_STEP_KEY, String(clamped))
  } catch {
    /* ignore */
  }
}

export function clearRegistrationOnboardingSession(): void {
  try {
    sessionStorage.removeItem(REGISTRATION_ONBOARDING_PENDING_KEY)
    sessionStorage.removeItem(REGISTRATION_ONBOARDING_STEP_KEY)
  } catch {
    /* ignore */
  }
}
