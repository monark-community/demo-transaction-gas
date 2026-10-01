# FlexGas by Monark: site plan

Status: shipped on `develop`. This plan describes what the site does and is kept in sync with the code.

- Product: **FlexGas**, Monark's gas module: people move their tokens without holding the network's gas token, because a sponsor covers the fee or the fee is taken in a stablecoin they already hold.
- Authoritative description: https://www.monark.io/en/project/transaction-gas
- Branding: **Monark-branded** (`true`). `lovable-migration/monark-brand-guidelines.md` is binding, including the "Restraint" rules at the end of §8 and the standard header (§2, §10).
- Stack: Next.js 16 (App Router, `src/`, TypeScript strict), pnpm, Tailwind CSS v4, shadcn/ui on the Monark UI registry, `lucide-react`.

---

## 1. Product brief

**Target users.**

- **Newcomers holding stablecoins but no gas**: a student paid 120 tUSDC for a bounty who can't move it because the wallet has 0 tETH. This is the person the project page describes ("your funds are effectively locked").
- **Communities and dApps that sponsor their members' fees**: the treasurer of a student blockchain club, a ticketing dApp, an event organiser. They fund a *gas tank* and set limits so it can't be drained.
- **Wallet and dApp developers** in the Monark community who want to integrate gasless flows, and **brands and local partners** whose customers should never have to think about gas.
- Secondary: students learning how account abstraction and paymasters work.

**Core job to be done.** *"Let me use the tokens I have right now, without first buying a different token just to pay the fee, and without a fee surprise."* For sponsors: *"Let our members transact for free, within a budget we control."*

**Domain concepts** (each explained in plain words the first time the site uses it):

| Concept | Meaning in FlexGas |
|-|-|
| Gas / network fee | What a network charges to include a transaction, normally paid in its native token (tETH on the demo's networks). |
| Route | How a given fee gets paid. FlexGas checks three, in order: **sponsored**, **stablecoin**, **native gas**. |
| Gas tank (sponsor) | A smart contract balance that pays other people's fees (the project page's "gas fee paying account"). Funded by a community, dApp, brand or friend. |
| Sponsor safeguards | Limits the sponsor sets on the tank: a per-transaction fee cap, a daily number of sponsored transactions per member, which networks it covers, a pause switch and a low-balance alert. |
| Paymaster | The contract that settles the fee on the user's behalf (ERC-4337). It pays gas in tETH and collects what the route says: nothing (sponsored) or stablecoins. |
| Stablecoin quote | The price, in tUSDC or tDAI, of paying this fee: the gas cost converted at the reference price, plus a 5% service margin, rounded up to a tenth of a cent, minimum 0.02. Valid for 30 seconds. |
| Auto-conversion | On the stablecoin route, part of the payment is converted to tETH to settle the gas; the rest is the service margin. |
| Max fee | The user's own safeguard: a quote above it is never used. |
| Native fallback | When no sponsor applies and the stablecoin route is blocked, the fee is paid the ordinary way, in tETH, if the wallet holds some. |
| Multichain | The same wallet on three test networks (Sepolia, Base Sepolia, Arbitrum Sepolia) with very different gas costs; the tank covers the networks the sponsor chooses. |

Shared test tokens and reference prices (the Monark DeFi family's set, reused for consistency): `tETH` $3,200, `tUSDC` $1.00, `tDAI` $1.00, `tLINK` $14.50. No invented tokens, no mainnet names.

**What the Lovable version got wrong or left out.**

- A generic purple gradient landing page with a stock "network" image and three feature cards; nothing Monark and nothing that showed a fee being paid.
- Nothing worked: "Continue transaction" and "Sponsor" only logged to the console. No amount, recipient, network, quote or confirmation.
- The core mechanics were absent: no auto-conversion, no quote, no service margin, no safeguards on either side, no multichain, no fallback. "Use ETH" was simply disabled.
- The sponsor side was a static card; no way to fund a tank, set limits or see what it paid for.
- No transaction states (pending, confirmed, failed), no disclaimers, English only, an invalid wallet address in the mock data.

## 2. Value proposition

**FlexGas lets anyone in a Monark community move the tokens they hold without first buying gas: a sponsor covers the fee, or it is taken in a stablecoin they already have, always within limits both sides set, so a first transaction is as simple as a mobile payment.**

Supporting benefits, as outcomes:

1. **Your stablecoins are never stuck.** Zero tETH is no longer a dead end.
2. **You know the fee before you sign.** One quote, in the token you hold, never above your limit.
3. **Sponsors stay in control of the budget.** Members transact free; limits keep the tank from being drained.

## 3. Hero

- **Headline** (7 words): *Move your stablecoins without holding any gas.*
  FR: *Utilisez vos stablecoins sans détenir de gas.*
- **Supporting line** (15 words): *A sponsor covers the fee, or FlexGas takes it in the stablecoin you already hold.*
  FR: *Un sponsor paie les frais, ou FlexGas les prélève dans le stablecoin que vous avez déjà.*
- No eyebrow.
- **Primary CTA:** "Launch the demo" / « Lancer la démo » → `/{locale}/app`.
- **Secondary CTA:** "How a fee gets paid" / « Comment les frais sont payés » → `/{locale}/how-it-works`.
- **Visual:** a **live send card**, built in code. Noor's wallet shows *0 tETH* (tagged "no gas") and 120 tUSDC. She sends 40 tUSDC to Café Lumen; the three routes are checked one after the other (sponsored ✓, chosen), the card goes *Signing → Pending → Confirmed*, and the fee line reads "Fee paid by Campus Blockchain Club · $0 for you". A second loop shows the sponsor's daily limit reached, the route falling through to *Stablecoin* and the fee chip "1.916 tUSDC". About 9 s per loop, calm, final state rendered directly with reduced motion. Product UI over a photo because the product's promise is exactly this moment. The mesh butterfly sits large and cropped behind it.

## 4. Page map

All routes live under `/{locale}` (`en`, `fr`). `/` and any locale-less path redirect to the visitor's preferred language (fallback English) via `src/proxy.ts`.

| Route | Purpose | Sections, in order |
|-|-|-|
| `/{locale}` | Home: the idea in 30 seconds, then into the demo. Hero + 4 sections (budget: 5). | Hero with live send card · "Three ways a fee gets paid" (3 cards, each a title, one line and a UI fragment) · "Who it's for" (3 photo cards: newcomers, communities and dApps, local partners and brands) · FAQ (4 questions; the site's only FAQ) · Closing CTA (heading + button) |
| `/{locale}/app` | Demo, user side: the wallet. | Connect gate (when disconnected) · Balances with a network switcher (Sepolia, Base Sepolia, Arbitrum Sepolia) · Send card: token, amount, recipient, **fee routes** (three rows, best one selected, unavailable ones with a one-line reason), max fee chip, *Send* · Result panel after a send · Recent activity (4 at a time) |
| `/{locale}/app/tank` | Demo, sponsor side: the Campus Blockchain Club gas tank that Noor runs as treasurer. | Tank (balance gauge with the low-balance mark, ≈ transfers left, *Top up*) · Safeguards form (per-transaction cap, daily limit per member, networks, pause) · Sponsored activity (5 at a time) |
| `/{locale}/how-it-works` | Mechanics for curious users, students and developers. Everything mechanical lives here. | One-line intro · Which route pays (cascade diagram) · The stablecoin quote (worked example + split diagram) · Safeguards (for you / for sponsors) · Networks (table) · For developers (one line; integration snippet behind a disclosure) · CTA |
| `/{locale}/credits` | Photo, type, icon and brand credits (required by the asset rules). | Photos · Type and icons · Monark brand assets |
| `/{locale}/pricing` | **Internal strategy review only.** Never linked, excluded from the sitemap, `noindex, nofollow`. | Price card · What each party pays · Reasoning |
| 404 | Friendly not-found with the vertical Monark logo and links home and to the demo. | |

Two app routes and no more: the product has exactly two sides (the person paying a fee, the sponsor paying it for them). A separate "developers" page is not justified; a disclosure on `/how-it-works` holds the integration snippet.

**Header** (standard Monark navbar, guidelines §2 and §10, reference Splitflow `src/components/site/`): butterfly mark 28px + "FlexGas" (Nunito Sans 800, 18px) on one line, aria-label "FlexGas, by Monark: home" · 28px gap · links *Overview*, *How it works*, *Demo* (active in `foreground`) · right: Demo chip (`primary` at 8% light / 15% dark, `primary-ink` text) · EN/FR switch · theme toggle · primary *Launch demo*. Inside `/app` the action becomes the `connect-wallet` component. Below `lg`: brand + menu button; the sheet holds everything else. Marketing pages have exactly one top bar.

**Demo app bar** (only under `/app`, one compact bar): section nav *Wallet* · *Gas tank*, and one pill that shows the simulated network status and opens *Demo controls* (gas spike, paymaster offline, slow network, fail next transaction, reset demo); a small count on the pill shows how many are on. No testnet strip.

**Footer** (three bands): product line + links (Overview, How it works, Demo, Credits) · "FlexGas is built by Monark", Monark logo + tagline, project page and GitHub links, social icons · "© {year} Monark · Open source", "Demo · simulated data", photo credits link.

## 5. Feature highlights

| Feature | User benefit | Where it appears | Proven by flow |
|-|-|-|-|
| Sponsored fees (gas tank) | Newcomers transact for free | Home cards; hero loop; send routes; gas tank | Flows 2, 5 |
| Pay the fee in a stablecoin, auto-converted | Stablecoins are never stuck | Home cards; send routes; result split; `/how-it-works` quote | Flow 3 |
| Route cascade with native fallback | Something always pays, and you see what before you sign | Send routes; `/how-it-works` cascade | Flows 3, 4 |
| Safeguards on both sides | No fee surprise; no drained tank | Max fee chip; sponsor safeguards form; `/how-it-works` | Flows 3, 4, 5 |
| Multichain | Same wallet, the right route per network | Network switcher; tank networks; `/how-it-works` table | Flows 2, 4 |

## 6. Key flows

Every transaction goes through a simulated wallet prompt ("Confirm in your wallet": summary rows, network, **fee line showing the route** — "Sponsored by Campus Blockchain Club", "1.916 tUSDC (quote locked)" or "0.00057 tETH" — the testnet notice, *Confirm* / *Reject*), then *pending* with a hash (1.2 to 2.4 s; 3 to 6 s with "slow network"), then *confirmed* in a block or *failed*. Rejecting in the prompt gives "You rejected the request in your wallet. Nothing was sent."; "Fail the next transaction" gives "The network rejected the transaction. Nothing moved and no fee was charged."

1. **Connect.** `/app` → *Connect demo wallet* → sign-in message (no fee) → *pending* ("Waiting for signature…") → *connected*: Noor Haddad, `0x…` in the header. *Failed*: rejecting shows "You declined the sign-in. Nothing was shared." with retry.
2. **Send with zero gas, sponsored.** Sepolia, 0 tETH. Send 40 tUSDC to Café Lumen → routes: *Sponsored by Campus Blockchain Club* ✓ ("2 of 3 left today"), *Stablecoin* (1.916 tUSDC), *Native* ✗ ("No tETH on Sepolia") → *Send* → prompt (fee: Sponsored) → *pending* → *confirmed*: result "Sent 40 tUSDC to Café Lumen · fee paid by the club". Balances update; the tank's activity shows the new sponsored fee. *Validation*: invalid address, amount above balance, zero amount.
3. **Pay the fee in a stablecoin.** Switch to Arbitrum Sepolia (the club doesn't cover it) or send a third time on Sepolia (daily limit reached): the sponsored row shows why it's skipped, *Stablecoin* is selected with "0.032 tDAI" and a 30-second countdown (it re-quotes by itself; *How is this calculated?* shows gas × price + 5%) → *Send* → prompt (fee locked) → *pending* → *confirmed*: the **fee split**: the stablecoin chip splits into "converted to tETH for gas" and "service". *Blocked*: with *Gas spike* on Sepolia the quote exceeds the sponsor's cap and your max fee; all three routes show their reason and *Send* is replaced by "No route can pay this fee" with two actions: *Raise max fee* and *Switch network*.
4. **Fallback to native gas.** Demo controls → *Paymaster offline* → on Base Sepolia (0.0031 tETH) the sponsored and stablecoin rows read "Paymaster unreachable" and *Native gas* is selected automatically → send → prompt (fee in tETH) → confirmed; the result says "Paid in tETH: the paymaster was unreachable." On Sepolia (0 tETH) the same situation is *blocked*.
5. **Run the gas tank.** *Gas tank* → tank gauge (0.18343 tETH after the seeded fees, ≈ $586.98, "≈ 321 sponsored transfers left on Sepolia") → *Top up* 50, 100 or 200 tUSDC from Sepolia (converted at $3,200: 50 tUSDC → +0.015625 tETH; the admin fee is paid from the tank) → prompt → *pending* → *confirmed*: the gauge rises. → Safeguards: lower *daily limit per member* to 1, or untick Base Sepolia, → *Save* (signed message, no fee) → *pending* → "Saved. Applies to the next transaction." → back in *Wallet*, the sponsored route now shows the new reason. *Pause sponsorship* makes every member fall through to their own routes. *Empty*: "No sponsored fees yet." *Failed*: as above; the form keeps the draft.

## 7. Content (EN / FR)

Budgets (guidelines §8 "Restraint"): headline ≤ 10 words, one line ≤ 25, section = heading + at most one short line, card text ≤ 20 words. The shipped copy lives in `src/i18n/dictionaries/en.ts` and `fr.ts` (typed; French must satisfy the English shape).

### Home

| Slot | English | Français |
|-|-|-|
| H1 | Move your stablecoins without holding any gas. | Utilisez vos stablecoins sans détenir de gas. |
| Line | A sponsor covers the fee, or FlexGas takes it in the stablecoin you already hold. | Un sponsor paie les frais, ou FlexGas les prélève dans le stablecoin que vous avez déjà. |
| CTAs | Launch the demo · How a fee gets paid | Lancer la démo · Comment les frais sont payés |
| Routes H2 | Three ways a fee gets paid | Trois façons de payer les frais |
| Sponsored | **Sponsored.** Your community or the app pays, within limits it sets. (chip: "Paid by Campus Blockchain Club") | **Sponsorisé.** Votre communauté ou l'application paie, dans les limites qu'elle fixe. |
| Stablecoin | **In your stablecoin.** Quoted in tUSDC, converted to gas for you. (chip: "1.916 tUSDC · quote 0:30") | **Dans votre stablecoin.** Chiffré en tUSDC, converti en gas pour vous. |
| Native | **Native gas, as a fallback.** If nothing else applies and you hold tETH. (chip: "0.00057 tETH") | **Le gas natif, en dernier recours.** Si rien d'autre ne s'applique et que vous avez du tETH. |
| Who H2 | Built for the first transaction | Pensé pour la première transaction |
| Newcomers | **Newcomers.** Paid in stablecoins, zero gas, and still able to move them. | **Nouveaux venus.** Payés en stablecoins, sans gas, et pourtant libres de les utiliser. |
| Communities & dApps | **Communities and dApps.** Cover your members' fees with a budget you control. | **Communautés et dApps.** Payez les frais de vos membres avec un budget maîtrisé. |
| Partners & brands | **Local partners and brands.** Customers pay you without ever thinking about gas. | **Partenaires locaux et marques.** Vos clients vous paient sans jamais penser au gas. |
| Closing | Send a transfer with zero gas. / Launch the demo | Envoyez un transfert sans gas. / Lancer la démo |

**FAQ** (home only, 4 questions)

1. *Is this real?* No. It's a testnet demo with simulated data. Nothing leaves your browser. / *Est-ce réel ?* Non. C'est une démo sur testnet, avec des données simulées. Rien ne quitte votre navigateur.
2. *Who pays a sponsored fee?* The sponsor's gas tank: a community, app or brand that funded it and set its limits. / *Qui paie des frais sponsorisés ?* Le réservoir du sponsor : une communauté, une application ou une marque qui l'a alimenté et en a fixé les limites.
3. *What if the sponsor runs out?* FlexGas moves to the next route, your stablecoin, then your own tETH. You see which before signing. / *Et si le sponsor est à sec ?* FlexGas passe à l'option suivante : votre stablecoin, puis votre propre tETH. Vous le voyez avant de signer.
4. *Can a fee surprise me?* No. You set a max fee, and each quote holds for 30 seconds. / *Les frais peuvent-ils me surprendre ?* Non. Vous fixez un plafond, et chaque devis tient 30 secondes.

### How it works

| Slot | English | Français |
|-|-|-|
| H1 / intro | How a fee gets paid · The rules FlexGas follows for every transaction. | Comment les frais sont payés · Les règles que FlexGas suit à chaque transaction. |
| Cascade | Which route pays · 1 Sponsor: covers this network, under its cap and daily limit. 2 Stablecoin: enough tUSDC or tDAI, quote under your max fee. 3 Native gas: you hold enough tETH. | Quelle option paie · 1 Sponsor : couvre ce réseau, sous son plafond et sa limite du jour. 2 Stablecoin : assez de tUSDC ou de tDAI, devis sous votre plafond. 3 Gas natif : vous avez assez de tETH. |
| Quote | The stablecoin quote · 95,000 gas × 6 gwei = 0.00057 tETH · × $3,200 = $1.82 · + 5% service = 1.916 tUSDC. $1.824 is converted to tETH to pay the network; $0.092 runs the paymaster. | Le devis en stablecoin · 95 000 gas × 6 gwei = 0,00057 tETH · × 3 200 $ = 1,82 $ · + 5 % de service = 1,916 tUSDC. 1,824 $ est converti en tETH pour payer le réseau ; 0,092 $ fait tourner le paymaster. |
| Safeguards | For you: max fee · 30-second quotes · only the fee token is touched. For sponsors: per-transaction cap · daily limit per member · networks · pause · low-balance alert. | Pour vous : plafond de frais · devis de 30 secondes · seul le jeton des frais est touché. Pour les sponsors : plafond par transaction · limite quotidienne par membre · réseaux · pause · alerte de solde bas. |
| Networks | Sepolia ≈ $1.82 · Base Sepolia ≈ $0.018 · Arbitrum Sepolia ≈ $0.030 per transfer | idem, formatted for fr-CA |
| Developers | One hook for wallets and dApps: ask FlexGas for routes, show them, send. (disclosure: "Show the integration") | Un seul point d'intégration pour les wallets et les dApps : demandez les options à FlexGas, affichez-les, envoyez. |
| CTA | Try the three routes. / Launch the demo | Essayez les trois options. / Lancer la démo |

### App: key strings

| Slot | English | Français |
|-|-|-|
| Connect gate | Connect a demo wallet · Send tokens with zero gas, or run a gas tank. | Connectez un portefeuille de démo · Envoyez des jetons sans gas, ou gérez un réservoir. |
| No gas tag | No gas | Pas de gas |
| Routes label | Who pays the fee | Qui paie les frais |
| Sponsored ok | Sponsored by {sponsor} · {n} of {max} left today | Sponsorisé par {sponsor} · {n} sur {max} restants aujourd'hui |
| Reasons | Not covered on {network} · Daily limit reached · Above the sponsor's cap · Sponsorship paused · Tank empty · Paymaster unreachable · Not enough {token} · Above your max fee · No tETH on {network} | Non couvert sur {network} · Limite du jour atteinte · Au-dessus du plafond du sponsor · Sponsoring en pause · Réservoir vide · Paymaster injoignable · Pas assez de {token} · Au-dessus de votre plafond · Pas de tETH sur {network} |
| Quote | Quote refreshes in {s}s | Devis actualisé dans {s} s |
| Blocked | No route can pay this fee. · Raise max fee · Switch network | Aucune option ne peut payer ces frais. · Relever le plafond · Changer de réseau |
| Result | Sent {amount} to {name} · Fee paid by {sponsor} / Fee: {fee} ({converted} converted to gas, {service} service) / Paid in tETH | Envoyé : {amount} à {name} · Frais payés par {sponsor} / Frais : {fee} ({converted} convertis en gas, {service} de service) / Payé en tETH |
| Disclaimer (prompt only) | Testnet demo · not financial advice · no real funds | Démo sur testnet · ceci n'est pas un conseil financier · aucun fonds réel |
| Pending | Sending… | Envoi en cours… |
| Failed (reverted) | The network rejected the transaction. Nothing moved and no fee was charged. | Le réseau a rejeté la transaction. Rien n'a bougé et aucuns frais n'ont été prélevés. |
| Rejected | You rejected the request in your wallet. Nothing was sent. | Vous avez refusé la demande dans votre portefeuille. Rien n'a été envoyé. |
| Activity empty | No transactions on this network yet. | Aucune transaction sur ce réseau pour l'instant. |
| Tank empty activity | No sponsored fees yet. | Aucuns frais sponsorisés pour l'instant. |
| Saved | Saved. Applies to the next transaction. | Enregistré. S'applique dès la prochaine transaction. |
| Storage error | Your browser blocked local storage, so the demo will forget changes when you leave. | Votre navigateur bloque le stockage local : la démo oubliera vos changements à la fermeture. |

## 8. Aesthetics (within the Monark guidelines)

Colour, type, logo, header and footer are fixed by the guidelines: cream / espresso tokens derived from `#f88d10` with `--surface-tint: 1` (the §3 token block pasted over the registry `theme.json`), Nunito Sans 400/600/700/800, pill actions, 1rem cards, borders rather than shadows, flat orange only.

- **Layout and rhythm.** Home: hero (copy left, live send card right; stacked on mobile) → three route cards on a `card` band → three photo cards → FAQ (single column) → divider → closing. The app is a working tool: on desktop a two-column wallet (balances and activity left, the send card right, the most important surface), single column on mobile with the send card first. The gas tank: gauge card on top, safeguards and activity side by side on desktop.
- **Hero visual.** The live send card (§3).
- **Mesh butterfly.** Once, on the home hero, large, cropped off the right edge, low opacity behind the card. Nowhere else. No gradients anywhere except inside the logo.
- **Illustrations.** No reused decorative Monark illustrations beyond the mesh. Line art drawn in code with flat orange strokes: the route cascade (three nodes on a line, the skipped ones hollow), the fee split (one line branching into "gas" and "service"), and the tank gauge.
- **Photography direction.** Warm daylight, real people: two friends laughing over a phone (newcomers), students gathered around a laptop (communities), a customer paying at a café table with a warm orange palette (partners). Only in "Who it's for", always with a line of copy.
- **Signature moments.**
  1. **The cascade.** Routes are checked one by one (≈150 ms apart); skipped ones fade with their reason, the chosen one fills with a flat orange ring. When a safeguard trips, you watch it fall through to the next route.
  2. **The fee split.** On a stablecoin-paid transfer, the fee chip splits into two lines: most of it becomes gas (flows to the network), a thin slice is the service margin.
  3. **The tank.** The gauge drains a notch for every sponsored fee and rises on top-up; the low-balance mark sits on it.
- Motion 150–250 ms ease-out (hero loop slower, explanatory), all of it disabled under `prefers-reduced-motion`.

## 9. Assets

| Asset | Purpose | Placement |
|-|-|-|
| `public/images/newcomers.jpg` (Unsplash, Karthik Balakrishnan) | Newcomers | Home "who it's for"; `/credits` |
| `public/images/community.jpg` (Unsplash, Vitaly Gariev) | Communities and dApps | Home "who it's for"; `/credits` |
| `public/images/partners.jpg` (Unsplash, SpotOn) | Local partners and brands | Home "who it's for"; `/credits` |
| `public/brand/*` Monark logos (standalone, horizontal light/dark, vertical light/dark), socials | Header, footer, 404, favicon, wallet prompt | Shell |
| `public/brand/monark-mesh.svg` | Home hero decoration | Home hero only |
| Open Graph image | Generated with `next/og` per locale | Metadata |

Icons: Lucide only. Diagrams in JSX/SVG. Credits in `docs/assets.md` and on `/credits`.

## 10. Pricing strategy

FlexGas is **free, included in the Monark bundle**: the module, the SDK and the sponsor console. Who pays what:

- **Sponsors** pay the gas they sponsor, at cost, from their own tank. No subscription, no per-member fee: the goal is to make sponsoring as cheap as possible for student associations and partners.
- **People paying in a stablecoin** pay the gas plus a 5% service margin (minimum 0.02). That margin is part of the product's documented mechanics (the project page: "keeping the rest as service revenue"): it covers price movement during the 30-second quote and the paymaster's rebalancing, and on Monark's hosted paymaster it goes back to the community treasury. Self-hosted paymasters set their own margin.
- Organisations wanting a supported deployment (own paymaster, custom network) go through Monark's partnership programme.

The margin shows up in the app only as part of a quote (and on `/how-it-works` as a mechanic), never as a price list. A designed `/{locale}/pricing` page exists **for internal review only**: not linked anywhere, excluded from `sitemap.xml`, `robots: { index: false, follow: false }`.

## 11. Out of scope

- Real wallets, chains, bundlers or paymasters (no wagmi/viem; the data layer in `src/lib/demo/` is shaped so it could be swapped in).
- Swapping or bridging tokens as a feature (conversion only happens inside a fee).
- More than one sponsor, sponsor discovery, per-contract allowlists, invitations to a tank, notifications.
- Real price feeds: prices are the fixed reference prices; gas prices are per-network constants with small drift and the "gas spike" control.
- A `/brand` page, a blog, a developers portal or any backend.

## 12. Implementation notes (as shipped)

Decisions taken while working unattended:

- **Routes are computed, not scripted.** `src/lib/demo/routes.ts` is a pure planner used by the wallet, the hero numbers, `/how-it-works` (worked example and network table) and the Open Graph image, so every figure on the site comes from the same rules. The first route that can pay is selected; the visitor can pick another available one before signing.
- **Stablecoin charges are rounded up to a tenth of a cent** (not a cent), so the 5% margin stays close to 5% on cheap networks (a $0.030 fee costs 0.032 tDAI, not 0.04). Stablecoin amounts therefore show up to three decimals.
- **The quote refreshes every 30 s** with a ±3% gas-price drift; the countdown freezes while the wallet prompt is open, so the locked quote is the one charged. The cascade replays only when the outcome changes (network, token, reason), not on every refresh.
- **Admin actions are paid from the tank.** A top-up's own network fee comes out of the tank, so a treasurer with no tETH can still fund it. Safeguard changes are a signed message (no fee).
- **One sponsor.** The route planner takes one tank; the connected wallet is both a member and the treasurer, which lets the visitor change a safeguard and immediately see its effect on their own routes.
- **Toasts.** The only toast is "Demo reset". Every other result is shown in place (send result card, gauge and status line, "Saved" line), so no overlay ever covers what it reports on.
- **One bar on marketing pages**, and one compact app bar under `/app` (sections + a Demo controls pill with a count of active controls). The testnet line appears only in the wallet prompt, for transactions that move value.
- **Header**: Splitflow's reference `brand.tsx`, `header.tsx`, `nav-links.tsx` and `mobile-menu.tsx`; the Demo chip is tinted `primary/8` in light mode and `primary/15` in dark (AA for its 12px bold text).
- **Theme**: `theme-2026.json` isn't published on ui.monark.io, so the `theme.json` base (Nunito Sans, variable structure) was used with the guidelines' §3 token block pasted over it in `src/app/globals.css`, plus muted `--success` / `--warning` status colours (always paired with a label).
- **Registry components** used: `wallet`, `connect-wallet`, `token-amount` (balances), `tx-status`, `network-badge`, plus shadcn `button`, `dialog`, `sheet`, `input`, `label`, `switch`, `dropdown-menu`. The `swap-form` doesn't fit (FlexGas doesn't swap). `token-amount`'s built-in dollar line prints "US$" in `en-CA`, so the dollar line is formatted by the site instead.
- Dependencies beyond the stack: `next-themes` (theme toggle without a flash), `sonner` (the reset toast), `react-jazzicon` (required by the registry `wallet`), `radix-ui` and `class-variance-authority` (registry components), `shadcn` (its Tailwind stylesheet); `playwright` as a dev dependency for `pnpm screenshots`. No recharts: the gauge and fee split are drawn in code.
- Copy budget (simplification checklist §4 applied from the start): EN dictionary 1,511 words (FR 1,642), measured with `node scripts/dictcount.mjs`; home = hero + 4 sections, 4 FAQ questions, no eyebrows, card lines ≤ 12 words.
