const TOKEN_KEY = "job-vacancy-api-token-v1"

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* ignore */
  }
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}
