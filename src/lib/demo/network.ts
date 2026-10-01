import type { ChainId, StableSymbol, TokenSymbol } from "./types"

/**
 * The simulated networks and prices. All three test networks use tETH as
 * their gas token; they differ in gas price, which is what makes routes differ.
 */
export const CHAIN_IDS: ChainId[] = ["sepolia", "base-sepolia", "arbitrum-sepolia"]

export const CHAINS: Record<ChainId, { name: string; gwei: number }> = {
  sepolia: { name: "Sepolia", gwei: 6 },
  "base-sepolia": { name: "Base Sepolia", gwei: 0.06 },
  "arbitrum-sepolia": { name: "Arbitrum Sepolia", gwei: 0.1 },
}

/** Reference prices shared by the Monark DeFi demos. */
export const PRICES: Record<TokenSymbol, number> = { tETH: 3200, tUSDC: 1, tDAI: 1, tLINK: 14.5 }

export const TOKENS: TokenSymbol[] = ["tETH", "tUSDC", "tDAI", "tLINK"]
export const STABLES: StableSymbol[] = ["tUSDC", "tDAI"]
export const isStable = (t: TokenSymbol): t is StableSymbol => t === "tUSDC" || t === "tDAI"

/** Gas used by a transfer from a smart account (user operation overhead included). */
export const GAS_UNITS = { token: 95_000, native: 70_000 } as const

/** The stablecoin route's service margin and its floor, in USD. */
export const SERVICE_RATE = 0.05
export const MIN_CHARGE = 0.02
export const QUOTE_SECONDS = 30
export const SPIKE_FACTOR = 4

/** Decimal places shown per token. */
export const DECIMALS: Record<TokenSymbol, number> = { tETH: 7, tUSDC: 3, tDAI: 3, tLINK: 3 }

/** Block height reference for seeded data (12 s blocks). */
export const SEED_HEAD = 7_412_880

export function isAddress(value: string): boolean {
  return /^0x[0-9a-fA-F]{40}$/.test(value.trim())
}

export function sameAddress(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase()
}
