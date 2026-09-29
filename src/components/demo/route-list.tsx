"use client"

import { CheckIcon, XIcon } from "lucide-react"
import { Popover as PopoverPrimitive } from "radix-ui"

import type { Locale } from "@/i18n/config"
import { t } from "@/i18n/t"
import { CHAINS, STABLES } from "@/lib/demo/network"
import type { Plan, RouteOption } from "@/lib/demo/routes"
import type { ChainId, RouteKind, StableSymbol } from "@/lib/demo/types"
import { formatNumber, formatToken, formatUsd } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"

/**
 * The fee routes as a radio group, drawn as a cascade: three nodes on one
 * line, checked top to bottom. Skipped routes show a dashed node and their
 * reason; the selected one fills orange and its ring draws itself.
 * Re-keyed by the caller whenever the outcome changes, so the cascade replays.
 */
export function RouteList({
  plan,
  selected,
  onSelect,
  chain,
  sponsor,
  secondsLeft,
  feeToken,
  onFeeToken,
  affordable,
  disabled,
}: {
  plan: Plan
  selected: number
  onSelect: (kind: RouteKind) => void
  chain: ChainId
  sponsor: string
  secondsLeft: number
  feeToken: StableSymbol
  onFeeToken: (t: StableSymbol) => void
  /** Stablecoins that could pay this fee. */
  affordable: StableSymbol[]
  disabled?: boolean
}) {
  const { app, locale } = useAppCopy()
  const r = app.routes

  return (
    <div role="radiogroup" aria-label={app.send.routes} className="relative flex flex-col">
      {/* The cascade's spine. */}
      <span aria-hidden="true" className="absolute top-6 bottom-6 left-[1.1875rem] w-px bg-border" />
      {plan.routes.map((route, i) => {
        const isSelected = i === selected
        return (
          <label
            key={route.kind}
            style={{ animationDelay: `${i * 150}ms` }}
            className={cn(
              "fg-in relative flex items-start gap-3 rounded-2xl px-2 py-2.5 transition-colors duration-150",
              route.ok && !disabled ? "cursor-pointer hover:bg-muted/60" : "cursor-default",
              isSelected && "bg-muted/70"
            )}
          >
            <input
              type="radio"
              name="route"
              value={route.kind}
              checked={isSelected}
              disabled={!route.ok || disabled}
              onChange={() => onSelect(route.kind)}
              className="peer sr-only"
            />
            <Node state={isSelected ? "selected" : route.ok ? "ok" : "skipped"} delay={i * 150 + 150} />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5 rounded-lg peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-ring">
              <span className="flex items-baseline justify-between gap-3">
                <span className={cn("font-bold", !route.ok && "text-muted-foreground")}>{title(route, r, feeToken)}</span>
                <span className="shrink-0 text-right text-sm font-bold tabular-nums">{price(route, r, locale)}</span>
              </span>
              <span className="text-sm text-muted-foreground">
                {detail(route, r, locale, chain, sponsor, secondsLeft)}
              </span>
            </span>
          </label>
        )
      })}
      {plan.routes[selected]?.kind === "stablecoin" && plan.routes[selected]?.ok ? (
        <StableExtras
          route={plan.routes[selected]}
          feeToken={feeToken}
          onFeeToken={onFeeToken}
          affordable={affordable}
          disabled={disabled}
        />
      ) : null}
    </div>
  )
}

type RouteCopy = ReturnType<typeof useAppCopy>["app"]["routes"]

function title(route: RouteOption, r: RouteCopy, feeToken: StableSymbol) {
  if (route.kind === "sponsored") return r.sponsored
  if (route.kind === "stablecoin") return t(r.payIn, { token: route.ok ? route.quote.token : feeToken })
  return r.native
}

function price(route: RouteOption, r: RouteCopy, locale: Locale) {
  if (!route.ok) return null
  if (route.kind === "sponsored") return <span className="text-success">{r.free}</span>
  if (route.kind === "stablecoin") return formatToken(route.quote.charge, route.quote.token, locale)
  return formatToken(route.gas.feeEth, "tETH", locale)
}

function detail(route: RouteOption, r: RouteCopy, locale: Locale, chain: ChainId, sponsor: string, secondsLeft: number) {
  if (!route.ok) {
    const vars: Record<string, string | number> = { network: CHAINS[chain].name, ...route.vars }
    if (route.reason === "aboveCap") vars.cap = formatUsd(Number(route.vars?.cap ?? 0), locale)
    if (route.reason === "aboveMax") vars.max = formatUsd(Number(route.vars?.max ?? 0), locale)
    return t(r.reasons[route.reason], vars)
  }
  if (route.kind === "sponsored") return `${sponsor} · ${t(r.left, { n: route.left, max: route.max })}`
  if (route.kind === "stablecoin") return t(r.refresh, { s: secondsLeft })
  return `${r.yourEth} · ${formatUsd(route.gas.feeUsd, locale)}`
}


function Node({ state, delay }: { state: "selected" | "ok" | "skipped"; delay: number }) {
  return (
    <span aria-hidden="true" className="relative z-10 mt-0.5 inline-flex size-6 shrink-0 items-center justify-center">
      {state === "selected" ? (
        <>
          <span className="absolute inset-0 rounded-full bg-primary" />
          <svg viewBox="0 0 24 24" className="absolute -inset-1 size-8">
            <circle
              cx="12"
              cy="12"
              r="11"
              pathLength={1}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="1.5"
              className="fg-ring"
              style={{ animationDelay: `${delay + 300}ms` }}
              transform="rotate(-90 12 12)"
            />
          </svg>
          <CheckIcon className="relative size-3.5 text-primary-foreground" strokeWidth={3} />
        </>
      ) : state === "ok" ? (
        <span className="size-4 rounded-full border-2 border-input bg-card" />
      ) : (
        <span className="inline-flex size-5 items-center justify-center rounded-full border border-dashed border-input bg-background">
          <XIcon className="size-3 text-muted-foreground" />
        </span>
      )}
    </span>
  )
}

function StableExtras({
  route,
  feeToken,
  onFeeToken,
  affordable,
  disabled,
}: {
  route: Extract<RouteOption, { kind: "stablecoin"; ok: true }>
  feeToken: StableSymbol
  onFeeToken: (t: StableSymbol) => void
  affordable: StableSymbol[]
  disabled?: boolean
}) {
  const { app, locale } = useAppCopy()
  const r = app.routes
  const q = route.quote
  return (
    <div className="fg-in ml-11 flex flex-wrap items-center gap-2 pt-1 pb-1 [animation-delay:450ms]">
      {affordable.length > 1 ? (
        <div role="radiogroup" aria-label={app.send.token} className="flex rounded-full border p-0.5">
          {STABLES.map((s) => (
            <button
              key={s}
              type="button"
              role="radio"
              aria-checked={feeToken === s}
              disabled={disabled || !affordable.includes(s)}
              onClick={() => onFeeToken(s)}
              className={cn(
                "inline-flex h-7 items-center rounded-full px-2.5 text-xs font-bold transition-colors disabled:opacity-50",
                q.token === s ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}
      <PopoverPrimitive.Root>
        <PopoverPrimitive.Trigger className="text-sm font-semibold text-primary-ink underline underline-offset-4">{r.calc}</PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            sideOffset={6}
            collisionPadding={16}
            className="z-50 w-72 rounded-2xl border bg-popover p-4 font-mono text-xs text-popover-foreground shadow-md outline-none"
          >
            <p>
              {t(r.calcLines.gas, {
                units: formatNumber(q.units, locale, 0),
                gwei: formatNumber(q.gwei, locale, 3),
                eth: formatNumber(q.feeEth, locale, 7),
              })}
            </p>
            <p className="mt-1">{t(r.calcLines.usd, { usd: formatUsd(q.feeUsd, locale) })}</p>
            <p className="mt-1 font-bold">{t(r.calcLines.service, { charge: formatToken(q.charge, q.token, locale) })}</p>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  )
}
