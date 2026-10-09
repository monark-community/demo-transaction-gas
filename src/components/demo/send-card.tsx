"use client"

import { CheckCircle2Icon, OctagonXIcon, SendIcon, SlidersHorizontalIcon } from "lucide-react"
import Link from "next/link"
import { useEffect, useId, useMemo, useState } from "react"

import { FeeSplit } from "@/components/diagrams/fee-split"
import { Button } from "@/components/ui/button"
import { FieldError } from "@/components/ui/field-error"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { TxStatus } from "@/components/ui/tx-status"
import { WalletAvatar } from "@/components/ui/wallet"
import { href } from "@/i18n/config"
import { t } from "@/i18n/t"
import { useTx } from "@/lib/demo/chain"
import { CHAIN_IDS, CHAINS, isAddress, isStable, QUOTE_SECONDS, sameAddress, STABLES, TOKENS } from "@/lib/demo/network"
import { applySend } from "@/lib/demo/ops"
import { newDrift, planRoutes, stableQuote, type Plan } from "@/lib/demo/routes"
import { CONTACTS } from "@/lib/demo/seed"
import { setPrefs } from "@/lib/demo/store"
import type { DemoState, RouteKind, StableSymbol, TokenSymbol, TxRecord } from "@/lib/demo/types"
import { formatBlock, formatToken, formatUsd, shortAddress } from "@/lib/format"

import { useAppCopy } from "./app-provider"
import { RouteList } from "./route-list"
import { TxFeedback } from "./tx-feedback"

const parseAmount = (s: string) => {
  const n = Number(s.replace(",", ".").trim())
  return Number.isFinite(n) ? n : NaN
}

/** The send form: token, amount, recipient, then who pays the fee. */
export function SendCard({ demo }: { demo: DemoState }) {
  const { app, locale } = useAppCopy()
  const s = app.send
  const chain = demo.prefs.chain
  const balances = demo.balances[chain]
  const uid = useId()

  const [token, setToken] = useState<TokenSymbol>("tUSDC")
  const [amountText, setAmountText] = useState("")
  const [to, setTo] = useState("")
  const [attempted, setAttempted] = useState(false)
  const [choice, setChoice] = useState<RouteKind | null>(null)
  const [feePref, setFeePref] = useState<StableSymbol | undefined>(undefined)
  const [drift, setDrift] = useState(1)
  const [quotedAt, setQuotedAt] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())
  const [maxOpen, setMaxOpen] = useState(false)
  const [result, setResult] = useState<TxRecord | null>(null)
  const tx = useTx()

  const amount = parseAmount(amountText)
  const plan: Plan = useMemo(
    () =>
      planRoutes({
        chain,
        token,
        amount: Number.isFinite(amount) && amount > 0 ? amount : 0,
        balances,
        tank: demo.tank,
        settings: demo.settings,
        maxFee: demo.prefs.maxFee,
        feeToken: feePref,
        drift,
      }),
    [chain, token, amount, balances, demo.tank, demo.settings, demo.prefs.maxFee, feePref, drift]
  )

  const chosenIndex = choice ? plan.routes.findIndex((r) => r.kind === choice && r.ok) : -1
  const selected = chosenIndex >= 0 ? chosenIndex : plan.best
  const route = plan.routes[selected]
  const locked = tx.busy

  // Quotes hold QUOTE_SECONDS, then refresh at the current gas price (frozen while signing or sending).
  useEffect(() => {
    if (locked || result) return
    const id = window.setInterval(() => {
      const current = Date.now()
      setNow(current)
      if (current - quotedAt >= QUOTE_SECONDS * 1000) {
        setDrift(newDrift())
        setQuotedAt(current)
      }
    }, 1000)
    return () => window.clearInterval(id)
  }, [locked, result, quotedAt])
  const secondsLeft = Math.max(0, QUOTE_SECONDS - Math.floor((now - quotedAt) / 1000))

  // Which stablecoins could pay this fee (for the fee-token switch).
  const affordable = STABLES.filter((st) => {
    const q = stableQuote(plan.gas, st)
    return balances[st] - (token === st && amount > 0 ? amount : 0) >= q.charge
  })

  // Validation (shown after the first attempt).
  const errors: { amount?: string; to?: string } = {}
  if (!amountText.trim() || !(amount > 0)) errors.amount = s.errors.amount
  else if (amount > balances[token] + 1e-12) errors.amount = t(s.errors.balance, { network: CHAINS[chain].name })
  if (!isAddress(to)) errors.to = s.errors.address
  else if (sameAddress(to, demo.wallet.address)) errors.to = s.errors.self
  const valid = !errors.amount && !errors.to

  // Replay the cascade whenever the outcome changes (not on every quote refresh).
  const cascadeKey = [chain, token, selected, ...plan.routes.map((r) => (r.ok ? "ok" : r.reason))].join("|")

  const contact = CONTACTS.find((c) => sameAddress(c.address, to))

  function submit() {
    setAttempted(true)
    if (!valid || !route?.ok || locked) return
    const fee =
      route.kind === "sponsored"
        ? t(app.summaries.sponsoredBy, { sponsor: demo.tank.name })
        : route.kind === "stablecoin"
          ? t(app.summaries.quoteLocked, { fee: formatToken(route.quote.charge, route.quote.token, locale) })
          : formatToken(route.gas.feeEth, "tETH", locale)
    const skipped = plan.routes.slice(0, selected).flatMap((r) => (r.ok ? [] : [{ kind: r.kind, reason: r.reason }]))
    const input = { chain, token, amount, to: to.trim(), toName: contact?.name, route, skipped }
    void tx.run(
      {
        title: t(app.summaries.send, { amount: formatToken(amount, token, locale) }),
        rows: [{ label: app.summaries.to, value: contact?.name ?? shortAddress(to.trim()) }],
        fee,
        chain,
        movesValue: true,
      },
      (hash, block) => setResult(applySend(input, hash, block))
    )
  }

  function reset() {
    setResult(null)
    setAmountText("")
    setTo("")
    setAttempted(false)
    setChoice(null)
    tx.reset()
  }

  function switchNetwork() {
    const next = CHAIN_IDS.filter((c) => c !== chain).find(
      (c) =>
        planRoutes({ chain: c, token, amount: 0, balances: demo.balances[c], tank: demo.tank, settings: demo.settings, maxFee: demo.prefs.maxFee })
          .best >= 0
    )
    setPrefs({ chain: next ?? CHAIN_IDS.find((c) => c !== chain)! })
  }

  if (result && tx.state.phase === "confirmed") {
    return <SendResult record={result} sponsor={demo.tank.name} onAgain={reset} />
  }

  return (
    <section aria-labelledby={`${uid}-title`} className="rounded-3xl border bg-card p-5 sm:p-6">
      <h2 id={`${uid}-title`} className="text-xl font-extrabold">
        {s.title}
      </h2>
      <fieldset disabled={locked} className="mt-5 flex flex-col gap-4">
        {/* Amount + token */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-baseline justify-between gap-3">
            <Label htmlFor={`${uid}-amount`}>{s.amount}</Label>
            <button
              type="button"
              onClick={() => setAmountText(String(balances[token]))}
              className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              {t(s.available, { amount: formatToken(balances[token], token, locale) })}
            </button>
          </div>
          <div className="flex gap-2">
            <Input
              id={`${uid}-amount`}
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              value={amountText}
              onChange={(e) => setAmountText(e.target.value)}
              aria-invalid={attempted && !!errors.amount}
              aria-describedby={attempted && errors.amount ? `${uid}-amount-err` : undefined}
              className="h-12 min-w-0 flex-1 text-lg font-bold tabular-nums"
            />
            <label className="sr-only" htmlFor={`${uid}-token`}>
              {s.token}
            </label>
            <NativeSelect
              id={`${uid}-token`}
              value={token}
              onChange={(e) => setToken(e.target.value as TokenSymbol)}
              className="[&>select]:h-12"
            >
              {TOKENS.map((tk) => (
                <NativeSelectOption key={tk} value={tk}>
                  {tk}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          <FieldError id={`${uid}-amount-err`}>{attempted ? errors.amount : null}</FieldError>
        </div>

        {/* Recipient */}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${uid}-to`}>{s.to}</Label>
          <Input
            id={`${uid}-to`}
            placeholder={s.toPlaceholder}
            autoComplete="off"
            spellCheck={false}
            value={to}
            onChange={(e) => setTo(e.target.value)}
            aria-invalid={attempted && !!errors.to}
            aria-describedby={attempted && errors.to ? `${uid}-to-err` : undefined}
            className="h-11 font-mono text-sm"
          />
          <ToggleGroup
            type="single"
            variant="chip"
            size="sm"
            aria-label={s.contacts}
            value={contact?.id ?? ""}
            onValueChange={(id) => {
              const picked = CONTACTS.find((c) => c.id === id)
              if (picked) setTo(picked.address)
            }}
            className="gap-1.5"
          >
            {CONTACTS.map((c) => (
              <ToggleGroupItem key={c.id} value={c.id} className="pr-3 pl-1 pointer-coarse:h-10">
                <WalletAvatar address={c.address} size={22} />
                {c.name}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <FieldError id={`${uid}-to-err`}>{attempted ? errors.to : null}</FieldError>
        </div>
      </fieldset>

      {/* Who pays the fee */}
      <div className="mt-6 border-t pt-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-1 font-bold">{s.routes}</h3>
          <MaxFee open={maxOpen} onOpenChange={setMaxOpen} value={demo.prefs.maxFee} disabled={locked} />
        </div>
        <div className="mt-2">
          <RouteList
            key={cascadeKey}
            plan={plan}
            selected={selected}
            onSelect={setChoice}
            chain={chain}
            sponsor={demo.tank.name}
            secondsLeft={secondsLeft}
            feeToken={feePref ?? (isStable(token) ? token : "tUSDC")}
            onFeeToken={setFeePref}
            affordable={affordable}
            disabled={locked}
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {plan.best < 0 ? (
          <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-destructive/40 bg-destructive/5 p-4">
            <p className="flex items-center gap-2 font-bold text-destructive">
              <OctagonXIcon className="size-4 shrink-0" aria-hidden="true" />
              {s.blocked}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => setMaxOpen(true)}>
                {s.raiseMax}
              </Button>
              <Button size="sm" variant="outline" onClick={switchNetwork}>
                {s.switchNetwork}
              </Button>
            </div>
          </div>
        ) : (
          <Button size="lg" className="w-full" onClick={submit} disabled={locked}>
            <SendIcon aria-hidden="true" />
            {s.submit}
          </Button>
        )}
        <TxFeedback state={tx.state} onRetry={submit} onDismiss={tx.reset} />
      </div>
    </section>
  )
}

/** The user's own safeguard, edited in a small popover. */
function MaxFee({
  open,
  onOpenChange,
  value,
  disabled,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  value: number
  disabled?: boolean
}) {
  const { app, locale } = useAppCopy()
  const s = app.send
  const [draft, setDraft] = useState(String(value))
  const [error, setError] = useState(false)
  const id = useId()

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        if (o) {
          setDraft(String(value))
          setError(false)
        }
        onOpenChange(o)
      }}
    >
      <PopoverTrigger asChild>
        <Button variant="outline" size="xs" disabled={disabled} className="pointer-coarse:h-9">
          <SlidersHorizontalIcon aria-hidden="true" />
          {t(s.maxFee, { max: formatUsd(value, locale) })}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={6} collisionPadding={16} className="w-64 rounded-2xl p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              const n = parseAmount(draft)
              if (!(n >= 0.02 && n <= 100)) return setError(true)
              setPrefs({ maxFee: Math.round(n * 100) / 100 })
              onOpenChange(false)
            }}
            className="flex flex-col gap-2"
          >
            <Label htmlFor={`${id}-max`}>{s.maxFeeLabel}</Label>
            <div className="flex gap-2">
              <Input
                id={`${id}-max`}
                inputMode="decimal"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                aria-invalid={error}
                className="min-w-0 flex-1 tabular-nums"
                autoFocus
              />
              <Button type="submit" size="default">
                {s.maxFeeSave}
              </Button>
            </div>
            <FieldError>{error ? s.errors.maxFee : null}</FieldError>
          </form>
      </PopoverContent>
    </Popover>
  )
}

/** After a confirmed transfer: what moved and who paid the fee. */
function SendResult({ record, sponsor, onAgain }: { record: TxRecord; sponsor: string; onAgain: () => void }) {
  const { app, locale } = useAppCopy()
  const r = app.send.result
  const fee = record.feeAmount ?? 0
  const feeToken = record.feeToken ?? "tETH"
  const fellBack = record.route === "native" ? record.skipped?.find((x) => x.reason === "paymaster") ?? record.skipped?.[0] : undefined

  return (
    <section aria-live="polite" className="fg-in rounded-3xl border bg-card p-5 sm:p-6">
      <p className="flex items-start gap-2.5 text-xl font-extrabold">
        <CheckCircle2Icon className="mt-0.5 size-6 shrink-0 text-success" aria-hidden="true" />
        {t(r.sent, { amount: formatToken(record.amount, record.token, locale), name: record.counterpartyName ?? shortAddress(record.counterparty) })}
      </p>

      <div className="mt-5 rounded-2xl border bg-muted/40 p-4">
        {record.route === "sponsored" ? (
          <div className="flex flex-col gap-1">
            <p className="font-bold">{t(r.sponsored, { sponsor })}</p>
            <p className="text-sm font-bold text-success">{app.routes.free}</p>
          </div>
        ) : record.route === "stablecoin" ? (
          <FeeSplit
            total={t(r.stable, { fee: formatToken(fee, feeToken, locale) })}
            converted={formatUsd(stableConverted(record), locale)}
            service={formatUsd(fee - stableConverted(record), locale)}
            convertedLabel={r.converted}
            serviceLabel={r.service}
            ratio={stableConverted(record) / fee}
          />
        ) : (
          <div className="flex flex-col gap-1">
            <p className="font-bold">{t(r.native, { fee: formatToken(fee, "tETH", locale) })}</p>
            {fellBack ? (
              <p className="text-sm text-muted-foreground">
                {t(r.fallback, { reason: lowerFirst(t(app.routes.reasons[fellBack.reason], { network: CHAINS[record.chain].name, token: "tETH" })) })}
              </p>
            ) : null}
          </div>
        )}
      </div>

      <TxStatus
        status="confirmed"
        hash={record.hash}
        label={`${app.tx.confirmed} · ${CHAINS[record.chain].name} · #${formatBlock(record.block, locale)}`}
        className="mt-4"
      />

      <div className="mt-6 flex flex-wrap gap-2">
        <Button size="lg" onClick={onAgain}>
          {r.again}
        </Button>
        {record.route === "sponsored" ? (
          <Button asChild size="lg" variant="outline">
            <Link href={href(locale, "/app/tank")}>{r.viewTank}</Link>
          </Button>
        ) : null}
      </div>
    </section>
  )
}

/** The USD share of a stablecoin fee that was converted to gas. */
function stableConverted(record: TxRecord): number {
  return record.convertedUsd ?? record.feeAmount ?? 0
}

const lowerFirst = (x: string) => x.charAt(0).toLowerCase() + x.slice(1)
