import { intlLocale, type Locale } from "@/i18n/config"
import { DECIMALS } from "@/lib/demo/network"
import type { TokenSymbol } from "@/lib/demo/types"

export function formatNumber(n: number, locale: Locale, maxFrac = 2, minFrac = 0): string {
  return new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: maxFrac, minimumFractionDigits: minFrac }).format(n)
}

/** A token amount with its symbol: stablecoins always show cents, tETH up to 7 decimals. */
export function formatToken(amount: number, token: TokenSymbol, locale: Locale): string {
  const stable = token === "tUSDC" || token === "tDAI"
  return `${formatNumber(amount, locale, DECIMALS[token], stable ? 2 : 0)} ${token}`
}

/** US dollars; sub-cent amounts keep three decimals so a $0.018 fee doesn't read as $0.02. */
export function formatUsd(n: number, locale: Locale): string {
  const digits = n > 0 && n < 0.1 ? 3 : 2
  return new Intl.NumberFormat(intlLocale[locale], {
    style: "currency",
    currency: "USD",
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n)
}

export function formatBlock(block: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale], { maximumFractionDigits: 0 }).format(block)
}

export function formatDateTime(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso))
}

/** "3 hours ago" style relative time, falling back to a date after a month. */
export function formatRelative(iso: string, locale: Locale, now = Date.now()): string {
  const diff = Date.parse(iso) - now
  const abs = Math.abs(diff)
  const rtf = new Intl.RelativeTimeFormat(intlLocale[locale], { numeric: "auto" })
  const min = 60_000
  const hour = 60 * min
  const day = 24 * hour
  if (abs < min) return rtf.format(0, "minute")
  if (abs < hour) return rtf.format(Math.round(diff / min), "minute")
  if (abs < day) return rtf.format(Math.round(diff / hour), "hour")
  if (abs < 30 * day) return rtf.format(Math.round(diff / day), "day")
  return new Intl.DateTimeFormat(intlLocale[locale], { dateStyle: "medium" }).format(new Date(iso))
}

export function shortAddress(address: string): string {
  return address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address
}
