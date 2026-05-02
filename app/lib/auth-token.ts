import { LEGACY_TOKEN_KEY, useAuthStore } from "~/stores/auth-store"

export function setAuthToken(token: string): void {
  useAuthStore.getState().setToken(token)
}

export function getAuthToken(): string | null {
  const t = useAuthStore.getState().token
  if (t) return t
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(LEGACY_TOKEN_KEY)
  } catch {
    return null
  }
}

export function clearAuthToken(): void {
  useAuthStore.getState().clearToken()
}
