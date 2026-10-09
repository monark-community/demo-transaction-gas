"use client"

import { createContext, useContext, useEffect, useSyncExternalStore, type ReactNode } from "react"

import { Toaster } from "@/components/ui/sonner"
import type { Dictionary } from "@/i18n"
import type { Locale } from "@/i18n/config"
import { initDemo } from "@/lib/demo/store"

import { WalletPrompt } from "./wallet-prompt"

export interface AppCopy {
  locale: Locale
  app: Dictionary["app"]
  disclaimer: string
  demoBadge: string
}

const AppContext = createContext<AppCopy | null>(null)

export function useAppCopy(): AppCopy {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error("useAppCopy must be used inside <AppProvider>")
  return ctx
}

export function AppProvider({ value, children }: { value: AppCopy; children: ReactNode }) {
  const narrow = useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(max-width: 767px)")
      mq.addEventListener("change", cb)
      return () => mq.removeEventListener("change", cb)
    },
    () => window.matchMedia("(max-width: 767px)").matches,
    () => false
  )
  useEffect(() => {
    initDemo()
  }, [])

  return (
    <AppContext.Provider value={value}>
      {children}
      <WalletPrompt />
      <Toaster
        // The only toast is "Demo reset": every flow reports its result in
        // place (send result, tank gauge, safeguards status), so a toast never
        // covers what it reports on. Desktop: top-right over the app bar;
        // phones: bottom.
        position={narrow ? "bottom-center" : "top-right"}
        offset={{ top: 80, right: 24 }}
        mobileOffset={{ bottom: 16, left: 16, right: 16 }}
      />
    </AppContext.Provider>
  )
}
