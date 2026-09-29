"use client"

import { FuelIcon } from "lucide-react"

import { TokenAmount } from "@/components/ui/token-amount"
import { intlLocale, type Locale } from "@/i18n/config"
import { CHAIN_IDS, CHAINS, DECIMALS, PRICES } from "@/lib/demo/network"
import type { ChainId, TokenSymbol } from "@/lib/demo/types"
import { cn } from "@/lib/utils"

/** A token amount through the registry `token-amount` component (DeFi family convention). */
export function Amount({
  value,
  token,
  locale,
  usd,
  className,
}: {
  value: number
  token: TokenSymbol
  locale: Locale
  usd?: boolean
  className?: string
}) {
  return (
    <TokenAmount
      value={BigInt(Math.round(value * 1e9))}
      decimals={9}
      symbol={token}
      fractionDigits={DECIMALS[token]}
      locale={intlLocale[locale]}
      usdValue={usd ? value * PRICES[token] : undefined}
      className={className}
    />
  )
}

/** A flat token disc: the ticker's letter on a warm neutral, tETH in orange (it's the gas token). */
export function TokenDot({ token, className }: { token: TokenSymbol; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-extrabold",
        token === "tETH" ? "bg-primary text-primary-foreground" : "border bg-secondary text-foreground",
        className
      )}
    >
      {token === "tETH" ? <FuelIcon className="size-4" /> : token.slice(1, 2)}
    </span>
  )
}

/** "No gas": amber, always with its label. */
export function NoGasChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-xs font-bold text-warning">
      <FuelIcon className="size-3" aria-hidden="true" />
      {label}
    </span>
  )
}

/** Pick one of the three networks (a radio group of pills). */
export function NetworkSwitcher({
  value,
  onChange,
  label,
  id,
}: {
  value: ChainId
  onChange: (c: ChainId) => void
  label: string
  id?: string
}) {
  return (
    <div role="radiogroup" aria-label={label} id={id} className="flex flex-wrap gap-1.5">
      {CHAIN_IDS.map((c) => {
        const active = c === value
        return (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(c)}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold transition-colors duration-150 pointer-coarse:h-11",
              active ? "border-foreground bg-foreground text-background" : "border-input text-muted-foreground hover:text-foreground"
            )}
          >
            {CHAINS[c].name}
          </button>
        )
      })}
    </div>
  )
}
