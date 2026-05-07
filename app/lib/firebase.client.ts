import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"

type FirebaseEnvKey =
  | "VITE_FIREBASE_API_KEY"
  | "VITE_FIREBASE_AUTH_DOMAIN"
  | "VITE_FIREBASE_PROJECT_ID"
  | "VITE_FIREBASE_STORAGE_BUCKET"
  | "VITE_FIREBASE_MESSAGING_SENDER_ID"
  | "VITE_FIREBASE_APP_ID"

function getFirebaseEnv(name: FirebaseEnvKey): string {
  const value = import.meta.env[name]
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(
      `Firebase não configurado: defina a variável de ambiente ${name}.`
    )
  }
  return value
}

const firebaseConfig = {
  apiKey: getFirebaseEnv("VITE_FIREBASE_API_KEY"),
  authDomain: getFirebaseEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: getFirebaseEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: getFirebaseEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getFirebaseEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getFirebaseEnv("VITE_FIREBASE_APP_ID"),
}

const firebaseApp = initializeApp(firebaseConfig)

export const firebaseAuth = getAuth(firebaseApp)
