/** Chave única — usada no script inline do `root` e no menu do usuário. */
export const THEME_STORAGE_KEY = "job-vacancy-ui-theme"

export type ThemeMode = "light" | "dark"

export function getStoredTheme(): ThemeMode | null {
  if (typeof window === "undefined") return null
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY)
    if (v === "dark" || v === "light") return v
  } catch {
    /* ignore */
  }
  return null
}

export function applyTheme(mode: ThemeMode) {
  const root = document.documentElement
  if (mode === "dark") root.classList.add("dark")
  else root.classList.remove("dark")
  try {
    localStorage.setItem(THEME_STORAGE_KEY, mode)
  } catch {
    /* ignore */
  }
}

/** Script síncrono para aplicar tema antes da pintura (evita flash). */
export function themeBootstrapInlineScript(): string {
  const k = JSON.stringify(THEME_STORAGE_KEY)
  return `(function(){try{var t=localStorage.getItem(${k});if(t==="dark")document.documentElement.classList.add("dark");else if(t==="light")document.documentElement.classList.remove("dark");}catch(e){}})();`
}
