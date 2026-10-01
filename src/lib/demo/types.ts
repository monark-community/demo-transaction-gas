export type Locale = "en" | "fr"

export type ChainId = "sepolia" | "base-sepolia" | "arbitrum-sepolia"
export type TokenSymbol = "tETH" | "tUSDC" | "tDAI" | "tLINK"
export type StableSymbol = "tUSDC" | "tDAI"
export type RouteKind = "sponsored" | "stablecoin" | "native"

export type Balances = Record<ChainId, Record<TokenSymbol, number>>

/** Why a route can't pay this fee. Rendered through the dictionary's `reasons`. */
export type ReasonCode =
  | "paymaster"
  | "notCovered"
  | "paused"
  | "dailyLimit"
  | "aboveCap"
  | "tankEmpty"
  | "notEnough"
  | "aboveMax"
  | "noNative"

export interface Contact {
  id: string
  name: string
  address: string
}

export interface TankPolicy {
  /** Largest fee the tank pays for one transaction, in USD. */
  perTxCapUsd: number
  /** Sponsored transactions per member per day. */
  dailyPerMember: number
  chains: ChainId[]
  paused: boolean
}

export interface TankEvent {
  id: string
  kind: "sponsored" | "topup"
  member: string
  address: string
  chain: ChainId
  /** tETH moved: the fee paid (sponsored) or added (top-up). */
  eth: number
  /** Top-ups: stablecoins paid in. */
  stable?: number
  hash: string
  block: number
  at: string
}

export interface Tank {
  name: string
  address: string
  balanceEth: number
  /** The low-balance alert threshold, in tETH. */
  lowEth: number
  members: number
  /** The connected member's sponsored transactions today. */
  usedToday: number
  policy: TankPolicy
  events: TankEvent[]
}

export interface TxRecord {
  id: string
  kind: "send" | "receive" | "topup"
  chain: ChainId
  token: TokenSymbol
  amount: number
  counterparty: string
  counterpartyName?: string
  route?: RouteKind
  feeToken?: TokenSymbol
  feeAmount?: number
  feeUsd?: number
  /** Stablecoin route: the USD share converted to tETH for gas. */
  convertedUsd?: number
  /** Routes checked before the one that paid, with their reason. */
  skipped?: { kind: RouteKind; reason: ReasonCode }[]
  hash: string
  block: number
  at: string
}

export interface WalletState {
  status: "disconnected" | "connecting" | "connected"
  address: string
  name: string
  lastError: "rejected" | null
}

export interface DemoSettings {
  slow: boolean
  failNext: boolean
  gasSpike: boolean
  paymasterOffline: boolean
}

export interface DemoPrefs {
  chain: ChainId
  /** The user's own safeguard: the most they pay in stablecoins for one fee. */
  maxFee: number
}

export interface DemoState {
  version: 1
  head: number
  wallet: WalletState
  balances: Balances
  tank: Tank
  activity: TxRecord[]
  settings: DemoSettings
  prefs: DemoPrefs
}

/** What the simulated wallet prompt shows. */
export interface TxSummary {
  title: string
  rows?: { label: string; value: string }[]
  /** Fee line, already formatted ("Sponsored by …", "1.916 tUSDC", "0.00057 tETH"). */
  fee?: string
  chain?: ChainId
  movesValue: boolean
  noFee?: boolean
}

export type TxPhase = "idle" | "signing" | "pending" | "confirmed" | "failed"

export interface TxState {
  phase: TxPhase
  hash?: string
  block?: number
  error?: "rejected" | "reverted"
}
