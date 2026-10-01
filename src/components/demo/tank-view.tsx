"use client"

import { CheckCircle2Icon, FuelIcon, TriangleAlertIcon } from "lucide-react"
import { useId, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { WalletAvatar } from "@/components/ui/wallet"
import { t } from "@/i18n/t"
import { useTx } from "@/lib/demo/chain"
import { CHAIN_IDS, CHAINS, PRICES } from "@/lib/demo/network"
import { applyPolicy, applyTopUp } from "@/lib/demo/ops"
import { gasQuote } from "@/lib/demo/routes"
import { useDemo } from "@/lib/demo/store"
import type { ChainId, DemoState, TankPolicy } from "@/lib/demo/types"
import { formatBlock, formatDateTime, formatNumber, formatRelative, formatToken, formatUsd } from "@/lib/format"
import { cn } from "@/lib/utils"

import { useAppCopy } from "./app-provider"
import { Amount } from "./bits"
import { TxFeedback } from "./tx-feedback"

/** The gauge's full scale, in tETH. */
const SCALE = 0.3
const PRESETS = [50, 100, 200]

/** The sponsor side: the club's gas tank, its safeguards and what it paid for. */
export function TankView() {
  const demo = useDemo()
  const { app } = useAppCopy()
  // Lives here: the form remounts (keyed by the policy) after a save or a reset.
  const [saved, setSaved] = useState(false)
  if (!demo) return null
  const k = app.tank

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-display sm:text-4xl">{demo.tank.name}</h1>
        <p className="mt-1 text-muted-foreground">
          {k.title} · {t(k.owner, { n: demo.tank.members })}
        </p>
      </div>
      <TankCard demo={demo} />
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Safeguards key={JSON.stringify(demo.tank.policy)} demo={demo} saved={saved} setSaved={setSaved} />
        <TankActivity demo={demo} />
      </div>
    </div>
  )
}

function TankCard({ demo }: { demo: DemoState }) {
  const { app, locale } = useAppCopy()
  const k = app.tank
  const u = k.topUp
  const id = useId()
  const tank = demo.tank
  const [open, setOpen] = useState(false)
  const [text, setText] = useState("100")
  const [attempted, setAttempted] = useState(false)
  const [done, setDone] = useState<number | null>(null)
  const tx = useTx()

  const perTransfer = gasQuote("sepolia", "tUSDC", demo.settings).feeEth
  const left = Math.floor(tank.balanceEth / perTransfer)
  const low = tank.balanceEth < tank.lowEth
  const fill = Math.min(100, (tank.balanceEth / SCALE) * 100)
  const mark = (tank.lowEth / SCALE) * 100
  const available = demo.balances.sepolia.tUSDC

  const amount = Number(text.replace(",", "."))
  const error = !(amount > 0) ? u.errors.amount : amount > available ? u.errors.balance : null
  const eth = amount > 0 ? amount / PRICES.tETH : 0

  function submit() {
    setAttempted(true)
    if (error || tx.busy) return
    const adminFee = perTransfer
    setDone(null)
    void tx
      .run(
        {
          title: app.summaries.topUp,
          rows: [
            { label: app.summaries.topUpPay, value: formatToken(amount, "tUSDC", locale) },
            { label: app.summaries.topUpGet, value: `≈ ${formatToken(eth, "tETH", locale)}` },
          ],
          fee: app.summaries.fromTank,
          chain: "sepolia",
          movesValue: true,
        },
        (hash, block) => applyTopUp(amount, adminFee, hash, block)
      )
      .then((ok) => {
        if (ok) {
          setDone(eth)
          setOpen(false)
          setAttempted(false)
        }
      })
  }

  return (
    <section aria-labelledby={`${id}-t`} className="rounded-3xl border bg-card p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id={`${id}-t`} className="text-sm font-bold text-muted-foreground">
            {k.balance}
          </h2>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-3">
            <span className="text-4xl font-extrabold tracking-display tabular-nums">{formatToken(tank.balanceEth, "tETH", locale).replace(" tETH", "")}</span>
            <span className="text-lg font-bold text-muted-foreground">tETH</span>
            <span className="text-muted-foreground tabular-nums">≈ {formatUsd(tank.balanceEth * PRICES.tETH, locale)}</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{t(k.left, { n: formatNumber(left, locale, 0) })}</p>
        </div>
        {!open ? (
          <Button size="lg" onClick={() => setOpen(true)} disabled={tx.busy} className="self-start">
            <FuelIcon aria-hidden="true" />
            {u.open}
          </Button>
        ) : null}
      </div>

      {/* The gauge: drains a notch per sponsored fee, rises on top-up. */}
      <div className="mt-6">
        <div
          role="meter"
          aria-valuemin={0}
          aria-valuemax={SCALE}
          aria-valuenow={tank.balanceEth}
          aria-valuetext={`${formatToken(tank.balanceEth, "tETH", locale)}${low ? ` · ${k.low}` : ""}`}
          aria-label={k.balance}
          className="relative h-4 rounded-full bg-muted ring-1 ring-border ring-inset"
        >
          <span
            className={cn("absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out", low ? "bg-warning" : "bg-primary")}
            style={{ width: `${fill}%` }}
          />
          <span aria-hidden="true" className="absolute -top-1 -bottom-1 w-0.5 rounded-full bg-foreground/70" style={{ left: `${mark}%` }} />
        </div>
        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span style={{ paddingLeft: `max(0px, calc(${mark}% - 2.5rem))` }}>{t(k.lowMark, { eth: formatToken(tank.lowEth, "tETH", locale) })}</span>
          {low ? (
            <span className="inline-flex items-center gap-1 font-bold text-warning">
              <TriangleAlertIcon className="size-3.5" aria-hidden="true" />
              {k.low}
            </span>
          ) : null}
        </div>
      </div>

      {open ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
          className="fg-in mt-6 flex flex-col gap-3 rounded-2xl border bg-muted/40 p-4"
          aria-labelledby={`${id}-u`}
        >
          <h3 id={`${id}-u`} className="font-bold">
            {u.title}
          </h3>
          <fieldset disabled={tx.busy} className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between gap-3">
              <Label htmlFor={`${id}-amount`}>{u.amount}</Label>
              <span className="text-xs text-muted-foreground">{t(u.available, { amount: formatToken(available, "tUSDC", locale) })}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Input
                id={`${id}-amount`}
                inputMode="decimal"
                value={text}
                onChange={(e) => setText(e.target.value)}
                aria-invalid={attempted && !!error}
                className="h-11 w-36 rounded-2xl text-base font-bold tabular-nums"
              />
              {PRESETS.map((p) => (
                <Button key={p} type="button" variant="outline" onClick={() => setText(String(p))} className="h-11">
                  {formatNumber(p, locale, 0)}
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">{t(u.receive, { eth: formatToken(eth, "tETH", locale) })}</p>
            {attempted && error ? <p className="text-sm text-destructive">{error}</p> : null}
          </fieldset>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="lg" disabled={tx.busy}>
              {u.submit}
            </Button>
            <Button type="button" size="lg" variant="ghost" onClick={() => setOpen(false)} disabled={tx.busy}>
              {app.controls.cancel}
            </Button>
          </div>
          <TxFeedback state={tx.state} onRetry={submit} onDismiss={tx.reset} />
        </form>
      ) : done ? (
        <p role="status" className="fg-in mt-4 flex items-center gap-2 text-sm font-semibold">
          <CheckCircle2Icon className="size-4 text-success" aria-hidden="true" />
          {t(u.done, { eth: formatToken(done, "tETH", locale) })}
        </p>
      ) : null}
    </section>
  )
}

function Safeguards({ demo, saved, setSaved }: { demo: DemoState; saved: boolean; setSaved: (v: boolean) => void }) {
  const { app } = useAppCopy()
  const g = app.tank.safeguards
  const id = useId()
  const policy = demo.tank.policy
  const [cap, setCap] = useState(String(policy.perTxCapUsd))
  const [daily, setDaily] = useState(String(policy.dailyPerMember))
  const [chains, setChains] = useState<ChainId[]>(policy.chains)
  const [paused, setPaused] = useState(policy.paused)
  const tx = useTx()

  const capN = Number(cap.replace(",", "."))
  const dailyN = Number(daily)
  const errors = {
    cap: !(capN >= 0.01 && capN <= 50) ? g.errors.cap : null,
    daily: !(Number.isInteger(dailyN) && dailyN >= 1 && dailyN <= 50) ? g.errors.daily : null,
    chains: chains.length === 0 && !paused ? g.errors.chains : null,
  }
  const next: TankPolicy = { perTxCapUsd: Math.round(capN * 100) / 100, dailyPerMember: dailyN, chains: CHAIN_IDS.filter((c) => chains.includes(c)), paused }
  const dirty =
    next.perTxCapUsd !== policy.perTxCapUsd ||
    next.dailyPerMember !== policy.dailyPerMember ||
    next.paused !== policy.paused ||
    next.chains.join() !== CHAIN_IDS.filter((c) => policy.chains.includes(c)).join()
  const valid = !errors.cap && !errors.daily && !errors.chains

  function save() {
    if (!valid || !dirty || tx.busy) return
    setSaved(false)
    void tx
      .run(
        { title: app.summaries.policy, rows: [{ label: app.summaries.signInRow, value: app.summaries.policyRow }], movesValue: false, noFee: true },
        () => applyPolicy(next),
        { ms: 900 }
      )
      .then((ok) => {
        if (ok) {
          setSaved(true)
          tx.reset()
        }
      })
  }

  return (
    <section aria-labelledby={`${id}-t`} className="rounded-3xl border bg-card p-5 sm:p-6">
      <h2 id={`${id}-t`} className="text-xl font-extrabold">
        {g.title}
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          save()
        }}
        onChange={() => setSaved(false)}
        className="mt-5 flex flex-col gap-5"
      >
        <fieldset disabled={tx.busy} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${id}-cap`}>{g.cap}</Label>
            <div className="relative w-36">
              <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true">
                $
              </span>
              <Input
                id={`${id}-cap`}
                inputMode="decimal"
                value={cap}
                onChange={(e) => setCap(e.target.value)}
                aria-invalid={!!errors.cap}
                aria-describedby={errors.cap ? `${id}-cap-e` : undefined}
                className="h-11 rounded-2xl pl-7 font-bold tabular-nums"
              />
            </div>
            {errors.cap ? (
              <p id={`${id}-cap-e`} className="text-sm text-destructive">
                {errors.cap}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${id}-daily`}>{g.daily}</Label>
            <Input
              id={`${id}-daily`}
              inputMode="numeric"
              value={daily}
              onChange={(e) => setDaily(e.target.value)}
              aria-invalid={!!errors.daily}
              aria-describedby={errors.daily ? `${id}-daily-e` : undefined}
              className="h-11 w-24 rounded-2xl font-bold tabular-nums"
            />
            {errors.daily ? (
              <p id={`${id}-daily-e`} className="text-sm text-destructive">
                {errors.daily}
              </p>
            ) : null}
          </div>
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-semibold">{g.chains}</legend>
            {CHAIN_IDS.map((c) => (
              <label key={c} className="flex min-h-9 cursor-pointer items-center gap-3 text-sm pointer-coarse:min-h-11">
                <input
                  type="checkbox"
                  checked={chains.includes(c)}
                  onChange={(e) => setChains((cur) => (e.target.checked ? [...cur, c] : cur.filter((x) => x !== c)))}
                  className="size-4 accent-[var(--primary)]"
                />
                {CHAINS[c].name}
              </label>
            ))}
            {errors.chains ? <p className="text-sm text-destructive">{errors.chains}</p> : null}
          </fieldset>
          <div className="flex items-center justify-between gap-4 rounded-2xl border px-4 py-3">
            <Label htmlFor={`${id}-pause`} className="font-semibold">
              {g.paused}
            </Label>
            <Switch id={`${id}-pause`} checked={paused} onCheckedChange={(v) => { setPaused(v); setSaved(false) }} />
          </div>
        </fieldset>
        <div className="flex flex-col gap-3">
          <Button type="submit" size="lg" disabled={!dirty || !valid || tx.busy} className="self-start">
            {g.save}
          </Button>
          <TxFeedback state={tx.state} onRetry={save} onDismiss={tx.reset} pendingLabel={app.tx.pending} />
          {saved ? (
            <p role="status" className="fg-in flex items-center gap-2 text-sm font-semibold">
              <CheckCircle2Icon className="size-4 text-success" aria-hidden="true" />
              {g.saved}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  )
}

function TankActivity({ demo }: { demo: DemoState }) {
  const { app, locale } = useAppCopy()
  const a = app.tank.activity
  const [shown, setShown] = useState(5)
  const events = demo.tank.events

  return (
    <section aria-labelledby="tank-activity" className="rounded-3xl border bg-card p-5 sm:p-6">
      <h2 id="tank-activity" className="text-xl font-extrabold">
        {a.title}
      </h2>
      {events.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{a.empty}</p>
      ) : (
        <>
          <ul className="mt-3 divide-y">
            {events.slice(0, shown).map((e) => (
              <li key={e.id} className="flex items-center gap-3 py-3">
                {e.kind === "topup" ? (
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground" aria-hidden="true">
                    <FuelIcon className="size-4" />
                  </span>
                ) : (
                  <WalletAvatar address={e.address} size={32} />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{e.kind === "topup" ? t(a.topup, { member: e.member }) : e.member}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {CHAINS[e.chain].name} ·{" "}
                    <time dateTime={e.at} title={`${formatDateTime(e.at, locale)} · #${formatBlock(e.block, locale)}`}>
                      {formatRelative(e.at, locale)}
                    </time>
                  </p>
                </div>
                <span className={cn("flex shrink-0 flex-col items-end text-right text-sm font-bold tabular-nums", e.kind === "topup" && "text-success")}>
                  {e.kind === "topup" ? (
                    `+${formatToken(e.eth, "tETH", locale)}`
                  ) : (
                    <>
                      <span>−{formatUsd(e.eth * PRICES.tETH, locale)}</span>
                      <Amount value={e.eth} token="tETH" locale={locale} className="text-xs font-normal text-muted-foreground" />
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
          {events.length > shown ? (
            <Button variant="ghost" size="sm" className="mt-2" onClick={() => setShown((n) => n + 5)}>
              {a.more}
            </Button>
          ) : null}
        </>
      )}
    </section>
  )
}
