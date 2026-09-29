"use client"

import { FuelIcon, Loader2Icon, WalletIcon, XCircleIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { href } from "@/i18n/config"
import { useDemo, useStorageOk } from "@/lib/demo/store"
import { connectWallet } from "@/lib/demo/wallet"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { DemoControls } from "./demo-controls"

/**
 * App chrome under the site header: ONE compact bar with the two sections on
 * the left and the demo controls pill on the right. No testnet strip: that
 * line lives in the wallet prompt, once per transaction. Gates on connection.
 */
export function AppFrame({ children }: { children: ReactNode }) {
  const demo = useDemo()
  const storageOk = useStorageOk()
  const { app } = useAppCopy()

  return (
    <div className="flex flex-1 flex-col">
      <AppBar connected={demo?.wallet.status === "connected"} />
      {!storageOk ? (
        <p role="alert" className="mx-auto mt-4 w-full max-w-6xl px-4 text-sm text-warning sm:px-6">
          {app.storageError}
        </p>
      ) : null}
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6 sm:px-6 lg:py-10">
        {!demo ? <AppLoading label={app.loading} /> : demo.wallet.status !== "connected" ? <ConnectGate /> : children}
      </div>
    </div>
  )
}

function AppBar({ connected }: { connected: boolean }) {
  const pathname = usePathname() ?? ""
  const { app, locale } = useAppCopy()
  const items = [
    { href: href(locale, "/app"), label: app.nav.wallet, icon: WalletIcon },
    { href: href(locale, "/app/tank"), label: app.nav.tank, icon: FuelIcon },
  ]

  return (
    <div className="border-b bg-secondary/40">
      <div className="mx-auto flex min-h-13 max-w-6xl items-center gap-2 px-4 sm:px-6">
        {connected ? (
          <nav aria-label={app.nav.label} className="min-w-0 flex-1">
            <ul className="flex items-center gap-1 py-2">
              {items.map((item) => {
                const active = pathname === item.href
                const Icon = item.icon
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-semibold transition-colors duration-150",
                        active ? "bg-card text-foreground ring-1 ring-border" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        ) : (
          <div className="flex-1" />
        )}
        <DemoControls />
      </div>
    </div>
  )
}

export function AppLoading({ label }: { label: string }) {
  return (
    <div role="status" aria-live="polite" className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_26rem]">
      <span className="sr-only">{label}</span>
      <div className="flex flex-col gap-4">
        <div className="h-10 w-72 animate-pulse rounded-full bg-muted" />
        <div className="h-56 animate-pulse rounded-3xl bg-muted" />
        <div className="h-40 animate-pulse rounded-3xl bg-muted" />
      </div>
      <div className="h-[28rem] animate-pulse rounded-3xl bg-muted" />
    </div>
  )
}

function ConnectGate() {
  const demo = useDemo()
  const { app } = useAppCopy()
  const g = app.gate
  const connecting = demo?.wallet.status === "connecting"
  const rejected = demo?.wallet.lastError === "rejected"

  return (
    <section aria-labelledby="gate-title" className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center py-8 text-center">
      <Image src="/brand/monark-mark.svg" alt="" width={56} height={56} unoptimized className="size-14" />
      <h1 id="gate-title" className="mt-6 text-3xl font-extrabold tracking-display">
        {g.title}
      </h1>
      <p className="mt-3 text-muted-foreground">{g.body}</p>
      <Button
        size="lg"
        className="mt-8 w-full sm:w-auto"
        disabled={connecting}
        onClick={() =>
          void connectWallet({
            title: app.summaries.signIn,
            rows: [{ label: app.summaries.signInRow, value: app.summaries.signInValue }],
            movesValue: false,
            noFee: true,
          })
        }
      >
        {connecting ? <Loader2Icon className="animate-spin" aria-hidden="true" /> : <WalletIcon aria-hidden="true" />}
        {connecting ? app.wallet.connecting : g.connect}
      </Button>
      <div aria-live="polite" className="mt-4 min-h-6">
        {rejected ? (
          <p role="alert" className="flex items-start gap-2 text-left text-sm text-destructive">
            <XCircleIcon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {g.rejected}
          </p>
        ) : null}
      </div>
    </section>
  )
}
