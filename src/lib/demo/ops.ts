"use client"

import { randomId } from "./ids"
import { PRICES } from "./network"
import { routeFee, type RouteOption } from "./routes"
import { ME } from "./seed"
import { update } from "./store"
import type { ChainId, RouteKind, ReasonCode, TankPolicy, TokenSymbol, TxRecord } from "./types"

/**
 * State changes applied when a simulated transaction confirms. Each takes the
 * transaction hash and block from the chain simulator.
 */

const round = (n: number, d = 9) => Math.round(n * 10 ** d) / 10 ** d

export interface SendInput {
  chain: ChainId
  token: TokenSymbol
  amount: number
  to: string
  toName?: string
  route: RouteOption
  skipped: { kind: RouteKind; reason: ReasonCode }[]
}

export function applySend(input: SendInput, hash: string, block: number): TxRecord | null {
  const fee = routeFee(input.route)
  if (!fee) return null
  const record: TxRecord = {
    id: randomId("tx"),
    kind: "send",
    chain: input.chain,
    token: input.token,
    amount: input.amount,
    counterparty: input.to,
    counterpartyName: input.toName,
    route: input.route.kind,
    feeToken: fee.token,
    feeAmount: fee.amount,
    feeUsd: fee.usd,
    convertedUsd: input.route.ok && input.route.kind === "stablecoin" ? input.route.quote.converted : undefined,
    skipped: input.skipped.length ? input.skipped : undefined,
    hash,
    block,
    at: new Date().toISOString(),
  }
  update((s) => {
    const bal = { ...s.balances[input.chain] }
    bal[input.token] = round(bal[input.token] - input.amount)
    let tank = s.tank
    if (input.route.kind === "sponsored") {
      tank = {
        ...tank,
        balanceEth: round(tank.balanceEth - fee.amount),
        usedToday: tank.usedToday + 1,
        events: [
          { id: record.id, kind: "sponsored", member: ME.name, address: ME.address, chain: input.chain, eth: fee.amount, hash, block, at: record.at },
          ...tank.events,
        ],
      }
    } else {
      bal[fee.token] = round(bal[fee.token] - fee.amount)
    }
    return { ...s, balances: { ...s.balances, [input.chain]: bal }, tank, activity: [record, ...s.activity] }
  })
  return record
}

/** Top up the tank with tUSDC from Sepolia, converted to tETH at the reference price. The tank pays its own admin fee. */
export function applyTopUp(stable: number, adminFeeEth: number, hash: string, block: number) {
  const eth = stable / PRICES.tETH
  const at = new Date().toISOString()
  update((s) => ({
    ...s,
    balances: { ...s.balances, sepolia: { ...s.balances.sepolia, tUSDC: round(s.balances.sepolia.tUSDC - stable) } },
    tank: {
      ...s.tank,
      balanceEth: round(s.tank.balanceEth + eth - adminFeeEth),
      events: [
        { id: randomId("tp"), kind: "topup", member: ME.name, address: ME.address, chain: "sepolia", eth, stable, hash, block, at },
        ...s.tank.events,
      ],
    },
    activity: [
      {
        id: randomId("tx"),
        kind: "topup",
        chain: "sepolia",
        token: "tUSDC",
        amount: stable,
        counterparty: s.tank.address,
        counterpartyName: s.tank.name,
        route: "sponsored",
        feeToken: "tETH",
        feeAmount: adminFeeEth,
        feeUsd: adminFeeEth * PRICES.tETH,
        hash,
        block,
        at,
      },
      ...s.activity,
    ],
  }))
}

export function applyPolicy(policy: TankPolicy) {
  update((s) => ({ ...s, tank: { ...s.tank, policy } }))
}
