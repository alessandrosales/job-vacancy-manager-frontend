import type { User } from "firebase/auth"

import { ApiError } from "~/lib/api/errors"
import type { ApiSessionUser } from "~/lib/api/resources/auth"

export function firebaseUserToApiSessionUser(user: User): ApiSessionUser {
  const createdAt = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toISOString()
    : new Date().toISOString()
  const updatedAt = user.metadata.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toISOString()
    : createdAt

  return {
    id: user.uid,
    name: user.displayName ?? user.email?.split("@")[0] ?? "Usuário",
    email: user.email ?? "",
    phone: user.phoneNumber ?? null,
    avatar_url: user.photoURL ?? null,
    bio: null,
    age: null,
    full_address: null,
    relationship_status: null,
    gender: null,
    preferred_language: "pt_br",
    created_at: createdAt,
    updated_at: updatedAt,
  }
}

export function firebaseAuthErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const parts = Object.values(error.fieldErrors).flat().filter(Boolean)
    if (parts.length > 0) {
      return parts.join(" ")
    }
    switch (error.status) {
      case 401:
        return "Sign-in couldn't be verified with the server."
      case 422:
        return "Invalid request to the server."
      case 404:
        return "Resource not found."
      default:
        return "Couldn't complete sign-in. Please try again."
    }
  }

  if (error instanceof TypeError) {
    return "Could not reach the API. Check your network and VITE_API_BASE_URL."
  }

  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code !== undefined
      ? String((error as { code: unknown }).code)
      : null

  switch (code) {
    case "auth/email-already-in-use":
      return "This email address is already in use."
    case "auth/invalid-email":
      return "Invalid email address."
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Invalid email or password."
    case "auth/weak-password":
      return "The password is too weak."
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled."
    case "auth/popup-blocked":
      return "Your browser blocked the sign-in popup."
    default:
      return "Could not sign in with Firebase. Please try again."
  }
}
