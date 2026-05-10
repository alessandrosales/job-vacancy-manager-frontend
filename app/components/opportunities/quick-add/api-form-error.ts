import { ApiError } from "~/lib/api/errors"

export function apiFormErrorFromUnknown(
  err: unknown,
  fallback: string
): string {
  if (err instanceof ApiError) {
    const base = err.fieldErrors.base?.[0]
    if (base) return base
    const first = Object.values(err.fieldErrors).flat()[0]
    if (first) return first
  }
  return fallback
}
