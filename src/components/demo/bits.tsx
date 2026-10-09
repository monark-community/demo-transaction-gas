"use client"

import { FuelIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { TokenAmount } from "@/components/ui/token-amount"
import { intlLocale, type Locale } from "@/i18n/config"
import { CHAIN_IDS, CHAINS, DECIMALS, PRICES } from "@/lib/demo/network"
import type { ChainId, TokenSymbol } from "@/lib/demo/types"
import { formatUsd } from "@/lib/format"
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
  const amount = (
    <TokenAmount
      value={BigInt(Math.round(value * 1e9))}
      decimals={9}
      symbol={token}
      fractionDigits={DECIMALS[token]}
      locale={intlLocale[locale]}
      mono
      className={usd ? undefined : className}
    />
  )
  if (!usd) return amount
  // The dollar line is formatted here (not by the component) so it reads "$120.00" / "120,00 $", not "US$".
  return (
    <span className={cn("inline-flex flex-col leading-tight", className)}>
      {amount}
      <span className="text-xs text-muted-foreground tabular-nums">{formatUsd(value * PRICES[token], locale)}</span>
    </span>
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
    <Badge variant="warning">
      <FuelIcon aria-hidden="true" />
      {label}
    </Badge>
  )
}

/** Pick one of the three networks (a single-choice row of chips). */
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
    <ToggleGroup
      type="single"
      variant="chip"
      size="sm"
      value={value}
      onValueChange={(c) => c && onChange(c as ChainId)}
      aria-label={label}
      id={id}
    >
      {CHAIN_IDS.map((c) => (
        <ToggleGroupItem key={c} value={c} className="pointer-coarse:h-11">
          {CHAINS[c].name}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  )
}
