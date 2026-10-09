# FlexGas by Monark

**Move your stablecoins without holding any gas.** FlexGas is Monark's gas module: a sponsor covers the fee, or FlexGas takes it in the stablecoin you already hold and converts it to gas for you, with safeguards on both sides, on several networks, and a fallback to ordinary gas.

This repository is the **demo site**: a Next.js app with a fully simulated wallet, chain and paymaster. No real network, wallet, keys or backend.

- Project page: https://www.monark.io/en/project/transaction-gas
- Site plan (product brief, flows, copy, design decisions): [`docs/site-plan.md`](docs/site-plan.md)
- Photo and brand credits: [`docs/assets.md`](docs/assets.md)

## What you can do in the demo

Open `/en/app` (or `/fr/app`) and connect the demo wallet. You are Noor Haddad, a student holding 120 tUSDC and no tETH on Sepolia, and treasurer of the Campus Blockchain Club's gas tank.

1. **Send with zero gas.** The club's tank sponsors the fee.
2. **Pay the fee in a stablecoin.** On Arbitrum Sepolia (not covered by the club), or once the daily limit is reached, the fee is quoted in tUSDC or tDAI (gas × reference price + 5% service), held for 30 seconds, and split on confirmation into "converted to gas" and "service".
3. **Fall back to native gas.** With *Paymaster offline* on, Base Sepolia pays in tETH; Sepolia shows that no route can pay.
4. **Run the gas tank.** Top it up with tUSDC, change its safeguards (per-transaction cap, daily limit per member, networks, pause) and watch the wallet's routes change.

*Demo controls* (in the app bar) add a gas spike, a paymaster outage, a slow network, a forced failure, and *Reset demo*.

## Run it locally

Requirements: Node 22 and pnpm 10.

```bash
pnpm install
pnpm dev            # http://localhost:3000
```

Other scripts:

```bash
pnpm lint
pnpm typecheck      # next typegen + tsc --noEmit
pnpm build && pnpm start
pnpm screenshots    # Playwright captures of every page and flow into docs/screenshots/ (needs `pnpm start -p 3156` running)
```

No environment variables are needed. `NEXT_PUBLIC_SITE_URL` optionally overrides the canonical URL (default `https://flexgas.monark.io`).

## How the simulation works

Everything lives behind a small typed data layer in `src/lib/demo/`, so it could be swapped for wagmi/viem and a real paymaster service without touching the UI:

| File | Role |
|-|-|
| `types.ts` | Domain types: balances per network, the gas tank and its policy, transactions, routes. |
| `network.ts` | The three test networks and their gas prices, the shared reference prices (tETH $3,200, tUSDC $1.00, tDAI $1.00, tLINK $14.50), the service margin. |
| `routes.ts` | Pure route planner: given a transfer and the state, which of *sponsored → stablecoin → native* can pay, why the others can't, and each quote. |
| `seed.ts` | Starting balances, contacts, the club's tank and its history. |
| `store.ts` | A tiny external store persisted to `localStorage` (every access in try/catch), plus the wallet-prompt promise. |
| `chain.ts` | Transaction lifecycle: wallet prompt → pending with a hash (1.2–2.4 s, or 3–6 s on a slow network) → confirmed in a block, or failed (rejected / reverted). |
| `wallet.ts`, `ops.ts` | Sign-in, and the state changes applied on confirmation (send, top-up, policy). |

The testnet notice ("Testnet demo · not financial advice · no real funds") appears once per transaction, in the wallet prompt; the footer carries "Demo · simulated data".

## Project structure

```
src/
  app/[locale]/          routes: home, how-it-works, app (wallet), app/tank, credits, pricing (unlinked), 404
  components/site/       the @monark/ui site header and footer, wired to the routes, i18n and wallet
  components/demo/       the app: wallet view, send card, route list, gas tank, wallet prompt, demo controls
  components/home/       the hero's live send card
  components/diagrams/   the fee split
  components/ui/         @monark/ui 2 registry items, unmodified (theme, primitives, site shell, wallet-prompt, tx-feedback, demo-controls…)
  i18n/                  typed EN/FR dictionaries
  lib/demo/              simulated chain, wallet, paymaster and route planner
```

## Deploy to Vercel

Import the repository in Vercel and deploy with the framework defaults (Next.js, pnpm). No `vercel.json` and no environment variables are required. Every page prerenders.

---

Built by [Monark](https://www.monark.io) · Open source · Demo with simulated data.
