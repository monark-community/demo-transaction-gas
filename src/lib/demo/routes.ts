import { CHAINS, GAS_UNITS, isStable, MIN_CHARGE, PRICES, SERVICE_RATE, SPIKE_FACTOR, STABLES } from "./network"
import type { ChainId, DemoSettings, ReasonCode, RouteKind, StableSymbol, Tank, TokenSymbol } from "./types"

/**
 * The route planner: pure functions, no React, no storage. Given a transfer
 * and the current state, it says which of the three routes can pay the fee,
 * why the others can't, and what each costs. A real integration would ask the
 * paymaster service for the same answer.
 */

export interface GasQuote {
  /** Gas price in gwei (after drift and spikes). */
  gwei: number
  units: number
  feeEth: number
  feeUsd: number
}

export interface StableQuote extends GasQuote {
  token: StableSymbol
  /** What the user pays, in the stablecoin. */
  charge: number
  /** The part converted to tETH to settle gas (USD). */
  converted: number
  /** The service margin (USD). */
  service: number
}

export function gasQuote(chain: ChainId, token: TokenSymbol, settings: Pick<DemoSettings, "gasSpike">, drift = 1): GasQuote {
  const gwei = CHAINS[chain].gwei * drift * (settings.gasSpike ? SPIKE_FACTOR : 1)
  const units = token === "tETH" ? GAS_UNITS.native : GAS_UNITS.token
  const feeEth = (units * gwei) / 1e9
  return { gwei, units, feeEth, feeUsd: feeEth * PRICES.tETH }
}

/** Gas converted at the reference price, plus the service margin, rounded up to a tenth of a cent, with a floor. */
export function stableCharge(feeUsd: number): number {
  return Math.max(MIN_CHARGE, Math.ceil(feeUsd * (1 + SERVICE_RATE) * 1000 - 1e-9) / 1000)
}

export function stableQuote(gas: GasQuote, token: StableSymbol): StableQuote {
  const charge = stableCharge(gas.feeUsd)
  return { ...gas, token, charge, converted: gas.feeUsd, service: Math.max(0, charge - gas.feeUsd) }
}

export interface PlanInput {
  chain: ChainId
  token: TokenSymbol
  amount: number
  balances: Record<TokenSymbol, number>
  tank: Tank
  settings: DemoSettings
  maxFee: number
  /** Preferred stablecoin for the fee. */
  feeToken?: StableSymbol
  drift?: number
}

export type RouteOption =
  | { kind: "sponsored"; ok: true; gas: GasQuote; left: number; max: number }
  | { kind: "stablecoin"; ok: true; quote: StableQuote }
  | { kind: "native"; ok: true; gas: GasQuote }
  | { kind: RouteKind; ok: false; reason: ReasonCode; vars?: Record<string, string | number>; quote?: StableQuote; gas?: GasQuote }

export interface Plan {
  gas: GasQuote
  routes: RouteOption[]
  /** Index of the first route that can pay, or -1 when none can. */
  best: number
}

export function planRoutes(input: PlanInput): Plan {
  const { chain, token, amount, balances, tank, settings, maxFee } = input
  const gas = gasQuote(chain, token, settings, input.drift ?? 1)
  const p = tank.policy

  // 1. Sponsored: the tank covers this network, is running, under its limits and funded.
  let sponsored: RouteOption
  if (settings.paymasterOffline) sponsored = { kind: "sponsored", ok: false, reason: "paymaster", gas }
  else if (!p.chains.includes(chain)) sponsored = { kind: "sponsored", ok: false, reason: "notCovered", gas }
  else if (p.paused) sponsored = { kind: "sponsored", ok: false, reason: "paused", gas }
  else if (tank.usedToday >= p.dailyPerMember)
    sponsored = { kind: "sponsored", ok: false, reason: "dailyLimit", vars: { max: p.dailyPerMember }, gas }
  else if (gas.feeUsd > p.perTxCapUsd) sponsored = { kind: "sponsored", ok: false, reason: "aboveCap", vars: { cap: p.perTxCapUsd }, gas }
  else if (tank.balanceEth < gas.feeEth) sponsored = { kind: "sponsored", ok: false, reason: "tankEmpty", gas }
  else sponsored = { kind: "sponsored", ok: true, gas, left: p.dailyPerMember - tank.usedToday, max: p.dailyPerMember }

  // 2. Stablecoin: a stable with enough left after the transfer, quote under the user's max fee.
  let stablecoin: RouteOption
  const preferred: StableSymbol = input.feeToken ?? (isStable(token) ? token : "tUSDC")
  const order = [preferred, ...STABLES.filter((s) => s !== preferred)]
  const afford = (s: StableSymbol) => {
    const q = stableQuote(gas, s)
    return (balances[s] ?? 0) - (token === s ? amount : 0) >= q.charge - 1e-9
  }
  const feeToken = order.find(afford)
  if (settings.paymasterOffline) stablecoin = { kind: "stablecoin", ok: false, reason: "paymaster" }
  else if (!feeToken) stablecoin = { kind: "stablecoin", ok: false, reason: "notEnough", vars: { token: preferred }, quote: stableQuote(gas, preferred) }
  else {
    const quote = stableQuote(gas, feeToken)
    stablecoin =
      quote.charge > maxFee + 1e-9
        ? { kind: "stablecoin", ok: false, reason: "aboveMax", vars: { max: maxFee }, quote }
        : { kind: "stablecoin", ok: true, quote }
  }

  // 3. Native gas: the ordinary way, if the wallet holds enough tETH.
  const ethLeft = (balances.tETH ?? 0) - (token === "tETH" ? amount : 0)
  const native: RouteOption =
    ethLeft >= gas.feeEth
      ? { kind: "native", ok: true, gas }
      : (balances.tETH ?? 0) <= 0
        ? { kind: "native", ok: false, reason: "noNative", gas }
        : { kind: "native", ok: false, reason: "notEnough", vars: { token: "tETH" }, gas }

  const routes = [sponsored, stablecoin, native]
  return { gas, routes, best: routes.findIndex((r) => r.ok) }
}

/** Fee actually charged by a route, for records and the wallet prompt. */
export function routeFee(route: RouteOption): { token: TokenSymbol; amount: number; usd: number } | null {
  if (!route.ok) return null
  if (route.kind === "stablecoin") return { token: route.quote.token, amount: route.quote.charge, usd: route.quote.charge }
  return { token: "tETH", amount: route.gas.feeEth, usd: route.gas.feeUsd }
}

/** A drift factor for a fresh quote: gas prices move a little between quotes. */
export function newDrift(): number {
  return 1 + (Math.random() - 0.5) * 0.06
}
