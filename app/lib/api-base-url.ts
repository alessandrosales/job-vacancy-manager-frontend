export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL
  if (typeof raw === "string" && raw.trim() !== "") {
    return raw.replace(/\/$/, "")
  }
  return "http://localhost:3000"
}
