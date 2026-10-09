"use client"

import { FuelIcon, Loader2Icon, WalletIcon, XCircleIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

import { AppLoading } from "@/components/ui/app-loading"
import { AppTabs } from "@/components/ui/app-tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { href } from "@/i18n/config"
import { useDemo, useStorageOk } from "@/lib/demo/store"
import { connectWallet } from "@/lib/demo/wallet"

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
        {!demo ? <AppFrameLoading label={app.loading} /> : demo.wallet.status !== "connected" ? <ConnectGate /> : children}
      </div>
    </div>
  )
}

function AppBar({ connected }: { connected: boolean }) {
  const pathname = usePathname() ?? ""
  const { app, locale } = useAppCopy()
  const tabs = connected
    ? [
        { href: href(locale, "/app"), label: app.nav.wallet, icon: <WalletIcon />, exact: true },
        { href: href(locale, "/app/tank"), label: app.nav.tank, icon: <FuelIcon /> },
      ]
    : []

  return <AppTabs tabs={tabs} pathname={pathname} LinkComponent={Link} label={app.nav.label} actions={<DemoControls />} />
}

/** The app's skeleton until the store hydrates: the wallet page's two columns. */
function AppFrameLoading({ label }: { label: string }) {
  return (
    <AppLoading label={label}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-72 rounded-full" />
          <Skeleton className="h-56 rounded-3xl" />
          <Skeleton className="h-40 rounded-3xl" />
        </div>
        <Skeleton className="h-[28rem] rounded-3xl" />
      </div>
    </AppLoading>
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
