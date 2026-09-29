"use client"

import { CheckCircle2Icon, CheckIcon, FuelIcon, Loader2Icon, XIcon } from "lucide-react"
import { useEffect, useState, useSyncExternalStore } from "react"

import { WalletAvatar } from "@/components/ui/wallet"
import type { Dictionary } from "@/i18n"
import { seededAddress } from "@/lib/demo/ids"
import { cn } from "@/lib/utils"

type Copy = Dictionary["home"]["card"]

const NOOR = seededAddress("noor-haddad")

/**
 * The hero's live send card. Noor holds 120 tUSDC and no tETH. Loop A: the
 * club sponsors the fee. Loop B: the club's daily limit is reached, so the
 * cascade falls through to her stablecoin. Each loop: check routes, sign,
 * send, confirm. Reduced motion renders loop A's final state.
 */
const STEPS = [700, 450, 450, 700, 900, 1400, 2800] // idle, r1, r2, r3, signing, pending, confirmed

export function HeroCard({ copy, stableFee, amounts }: { copy: Copy; stableFee: string; amounts: [string, string, string] }) {
  const reduced = useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
      mq.addEventListener("change", cb)
      return () => mq.removeEventListener("change", cb)
    },
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  )
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (reduced) return
    const id = window.setTimeout(() => setTick((n) => n + 1), STEPS[tick % STEPS.length])
    return () => window.clearTimeout(id)
  }, [tick, reduced])

  const step = reduced ? STEPS.length - 1 : tick % STEPS.length
  const loopB = !reduced && Math.floor(tick / STEPS.length) % 2 === 1
  const chosen = loopB ? 1 : 0
  const decided = step >= 3

  const rows = [
    { title: copy.sponsored, note: loopB ? copy.limit : null, ok: !loopB, price: loopB ? null : "$0" },
    { title: copy.stablecoin, note: null, ok: true, price: stableFee },
    { title: copy.native, note: copy.noNative, ok: false, price: null },
  ]

  const status =
    step <= 3
      ? { icon: <Loader2Icon className="size-4 animate-spin text-primary" />, text: copy.states.checking }
      : step === 4
        ? { icon: <Loader2Icon className="size-4 animate-spin text-primary" />, text: copy.states.signing }
        : step === 5
          ? { icon: <Loader2Icon className="size-4 animate-spin text-primary" />, text: copy.states.pending }
          : { icon: <CheckCircle2Icon className="size-4 text-success" />, text: `${copy.states.confirmed} · ${loopB ? copy.paidInStable : copy.paidBySponsor}` }

  return (
    <figure aria-label={copy.label} className="relative mx-auto w-full max-w-md rounded-[2rem] border bg-card p-5 sm:p-6">
      <div aria-hidden="true">
        <div className="flex items-center gap-3">
          <WalletAvatar address={NOOR} size={36} />
          <div className="min-w-0 flex-1 leading-tight">
            <p className="font-bold">{copy.wallet}</p>
            <p className="font-mono text-xs text-muted-foreground">0x{NOOR.slice(2, 6)}…{NOOR.slice(-4)}</p>
          </div>
          <span className="rounded-full border px-2.5 py-1 text-xs font-semibold">{copy.network}</span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border bg-muted/50 p-3">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <FuelIcon className="size-3.5" /> tETH
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-2">
              <span className="text-xl font-extrabold tabular-nums">0</span>
              <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[0.6875rem] font-bold text-warning">{copy.noGas}</span>
            </p>
          </div>
          <div className="rounded-2xl border bg-muted/50 p-3">
            <p className="text-xs font-semibold text-muted-foreground">tUSDC</p>
            <p className="mt-1 text-xl font-extrabold tabular-nums">{loopB && step === 6 ? amounts[2] : step === 6 || loopB ? amounts[1] : amounts[0]}</p>
          </div>
        </div>

        <p className="mt-5 text-sm font-bold">{copy.send}</p>

        <div className="mt-3 rounded-2xl border p-2">
          <p className="px-2 pt-1 pb-2 text-xs font-bold text-muted-foreground">{copy.routes}</p>
          <div className="relative">
            <span className="absolute top-5 bottom-5 left-[1.1875rem] w-px bg-border" />
            {rows.map((r, i) => {
              const shown = step >= i + 1
              const isChosen = decided && i === chosen
              return (
                <div
                  key={r.title}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-2 py-2 transition-[background-color,opacity] duration-200",
                    isChosen && "bg-muted/70",
                    !shown && "opacity-40"
                  )}
                >
                  <span className="relative z-10 inline-flex size-6 shrink-0 items-center justify-center">
                    {!shown ? (
                      <span className="size-4 rounded-full border-2 border-border bg-card" />
                    ) : isChosen ? (
                      <span className="fg-pop inline-flex size-6 items-center justify-center rounded-full bg-primary ring-2 ring-primary ring-offset-2 ring-offset-card">
                        <CheckIcon className="size-3.5 text-primary-foreground" strokeWidth={3} />
                      </span>
                    ) : r.ok ? (
                      <span className="size-4 rounded-full border-2 border-input bg-card" />
                    ) : (
                      <span className="inline-flex size-5 items-center justify-center rounded-full border border-dashed border-input bg-background">
                        <XIcon className="size-3 text-muted-foreground" />
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block truncate text-sm font-bold", shown && !r.ok && "text-muted-foreground")}>{r.title}</span>
                    {shown && r.note ? <span className="block truncate text-xs text-muted-foreground">{r.note}</span> : null}
                  </span>
                  {shown && r.price ? <span className="shrink-0 text-sm font-bold tabular-nums">{r.price}</span> : null}
                </div>
              )
            })}
          </div>
        </div>

        <p className="mt-4 flex min-h-6 items-center gap-2 text-sm font-semibold" key={`${step}-${loopB}`}>
          <span className="fg-in inline-flex items-center gap-2">
            {status.icon}
            {status.text}
          </span>
        </p>
      </div>
    </figure>
  )
}
