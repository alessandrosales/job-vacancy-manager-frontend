"use client"

import * as React from "react"

import { AppLanguageBridge } from "~/components/providers/app-language-bridge"
import { rehydrateAppStores } from "~/stores/rehydrate-app-stores"

export type { SessionUser } from "~/stores/session-user-store"
export { useSessionUser } from "~/stores/session-user-store"

export function SessionUserProvider({
  children,
}: {
  children: React.ReactNode
}) {
  React.useEffect(() => {
    void rehydrateAppStores()
  }, [])

  return (
    <>
      <AppLanguageBridge />
      {children}
    </>
  )
}
