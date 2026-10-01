import { seededAddress, seededHash } from "./ids"
import { SEED_HEAD } from "./network"
import type { Contact, DemoState, TankEvent, TxRecord } from "./types"

/**
 * The demo's starting point. Noor Haddad, a student and the treasurer of the
 * Campus Blockchain Club, was paid 150 tUSDC for a bounty on Sepolia but holds
 * no tETH there. The club runs a gas tank that sponsors members' fees.
 */

export const ME = { name: "Noor Haddad", address: seededAddress("noor-haddad") }
export const CLUB = { name: "Campus Blockchain Club", address: seededAddress("campus-club-tank") }

export const CONTACTS: Contact[] = [
  { id: "cafe-lumen", name: "Café Lumen", address: seededAddress("cafe-lumen") },
  { id: "amara", name: "Amara Okafor", address: seededAddress("amara-okafor") },
  { id: "lea", name: "Léa Tremblay", address: seededAddress("lea-tremblay") },
  { id: "diego", name: "Diego Ramirez", address: seededAddress("diego-ramirez") },
]

export function contactName(address: string): string | undefined {
  const a = address.toLowerCase()
  if (a === CLUB.address.toLowerCase()) return CLUB.name
  return CONTACTS.find((c) => c.address.toLowerCase() === a)?.name
}

const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

export function createSeed(now = Date.now()): DemoState {
  const at = (ago: number) => new Date(now - ago).toISOString()
  const block = (ago: number) => SEED_HEAD - Math.round(ago / 12_000)

  const member = (id: string, name: string, chain: TankEvent["chain"], eth: number, ago: number): TankEvent => ({
    id,
    kind: "sponsored",
    member: name,
    address: seededAddress(name),
    chain,
    eth,
    hash: seededHash(id),
    block: block(ago),
    at: at(ago),
  })

  const events: TankEvent[] = [
    { ...member("s1", ME.name, "sepolia", 0.000566, 2 * HOUR), address: ME.address },
    member("s2", "Amara Okafor", "base-sepolia", 0.0000058, 5 * HOUR),
    member("s3", "Karim Benali", "sepolia", 0.000571, 9 * HOUR),
    member("s4", "Léa Tremblay", "sepolia", 0.000553, 1 * DAY + 3 * HOUR),
    member("s5", "Sofia Marin", "base-sepolia", 0.0000056, 1 * DAY + 7 * HOUR),
    member("s6", "Diego Ramirez", "sepolia", 0.000579, 2 * DAY + 1 * HOUR),
    member("s7", "Karim Benali", "base-sepolia", 0.0000057, 2 * DAY + 6 * HOUR),
    {
      id: "t1",
      kind: "topup",
      member: ME.name,
      address: ME.address,
      chain: "sepolia",
      eth: 0.0625,
      stable: 200,
      hash: seededHash("t1"),
      block: block(3 * DAY),
      at: at(3 * DAY),
    },
  ]

  const activity: TxRecord[] = [
    {
      id: "a1",
      kind: "send",
      chain: "sepolia",
      token: "tUSDC",
      amount: 30,
      counterparty: CONTACTS[0]!.address,
      counterpartyName: CONTACTS[0]!.name,
      route: "sponsored",
      feeToken: "tETH",
      feeAmount: 0.000566,
      feeUsd: 1.81,
      hash: seededHash("s1"),
      block: block(2 * HOUR),
      at: at(2 * HOUR),
    },
    {
      id: "a2",
      kind: "receive",
      chain: "sepolia",
      token: "tUSDC",
      amount: 150,
      counterparty: CLUB.address,
      counterpartyName: CLUB.name,
      hash: seededHash("a2"),
      block: block(1 * DAY + 2 * HOUR),
      at: at(1 * DAY + 2 * HOUR),
    },
    {
      id: "a3",
      kind: "receive",
      chain: "base-sepolia",
      token: "tUSDC",
      amount: 48.5,
      counterparty: CONTACTS[1]!.address,
      counterpartyName: CONTACTS[1]!.name,
      hash: seededHash("a3"),
      block: block(4 * DAY),
      at: at(4 * DAY),
    },
    {
      id: "a4",
      kind: "receive",
      chain: "base-sepolia",
      token: "tETH",
      amount: 0.0031,
      counterparty: CONTACTS[3]!.address,
      counterpartyName: CONTACTS[3]!.name,
      hash: seededHash("a4"),
      block: block(5 * DAY),
      at: at(5 * DAY),
    },
    {
      id: "a5",
      kind: "receive",
      chain: "arbitrum-sepolia",
      token: "tDAI",
      amount: 12,
      counterparty: CONTACTS[2]!.address,
      counterpartyName: CONTACTS[2]!.name,
      hash: seededHash("a5"),
      block: block(6 * DAY),
      at: at(6 * DAY),
    },
  ]

  return {
    version: 1,
    head: SEED_HEAD,
    wallet: { status: "disconnected", address: ME.address, name: ME.name, lastError: null },
    balances: {
      sepolia: { tETH: 0, tUSDC: 120, tDAI: 25, tLINK: 4 },
      "base-sepolia": { tETH: 0.0031, tUSDC: 48.5, tDAI: 0, tLINK: 0 },
      "arbitrum-sepolia": { tETH: 0, tUSDC: 0, tDAI: 12, tLINK: 0 },
    },
    tank: {
      name: CLUB.name,
      address: CLUB.address,
      balanceEth: 0.184,
      lowEth: 0.05,
      members: 38,
      usedToday: 1,
      policy: { perTxCapUsd: 3, dailyPerMember: 3, chains: ["sepolia", "base-sepolia"], paused: false },
      events,
    },
    activity,
    settings: { slow: false, failNext: false, gasSpike: false, paymasterOffline: false },
    prefs: { chain: "sepolia", maxFee: 5 },
  }
}
