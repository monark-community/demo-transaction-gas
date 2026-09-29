"use client"

import { ArrowDownLeftIcon, ArrowUpRightIcon, FuelIcon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { t } from "@/i18n/t"
import { CHAINS, PRICES, TOKENS } from "@/lib/demo/network"
import { setPrefs, useDemo } from "@/lib/demo/store"
import type { TxRecord } from "@/lib/demo/types"
import { formatBlock, formatDateTime, formatRelative, formatToken, formatUsd, shortAddress } from "@/lib/format"

import { useAppCopy } from "./app-provider"
import { Amount, NetworkSwitcher, NoGasChip, TokenDot } from "./bits"
import { SendCard } from "./send-card"

/** The user side of the demo: network, balances, the send card and activity. */
export function WalletView() {
  const demo = useDemo()
  const { app, locale } = useAppCopy()
  const w = app.walletView
  const [shown, setShown] = useState(4)
  if (!demo) return null

  const chain = demo.prefs.chain
  const balances = demo.balances[chain]
  const total = TOKENS.reduce((sum, tk) => sum + balances[tk] * PRICES[tk], 0)
  const activity = demo.activity.filter((a) => a.chain === chain)
  const network = CHAINS[chain].name

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="text-3xl font-extrabold tracking-display sm:text-4xl">{w.title}</h1>
        <NetworkSwitcher value={chain} onChange={(c) => setPrefs({ chain: c })} label={w.networks} id="network-switcher" />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_28rem]">
        <div className="order-2 flex min-w-0 flex-col gap-6 lg:order-1">
          {/* Balances */}
          <section aria-labelledby="balances-title" className="rounded-3xl border bg-card p-5 sm:p-6">
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="balances-title" className="font-bold">
                {t(w.balances, { network })}
              </h2>
              <p className="text-sm text-muted-foreground">
                {w.total} <span className="font-bold text-foreground tabular-nums">{formatUsd(total, locale)}</span>
              </p>
            </div>
            <ul className="mt-4 divide-y">
              {TOKENS.map((tk) => (
                <li key={tk} className="flex items-center gap-3 py-3">
                  <TokenDot token={tk} />
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="font-bold">{tk}</span>
                    {tk === "tETH" && balances.tETH <= 0 ? <NoGasChip label={w.noGas} /> : null}
                  </div>
                  <Amount value={balances[tk]} token={tk} locale={locale} usd className="items-end text-right" />
                </li>
              ))}
            </ul>
          </section>

          {/* Activity */}
          <section aria-labelledby="activity-title" className="rounded-3xl border bg-card p-5 sm:p-6">
            <h2 id="activity-title" className="font-bold">
              {t(w.activity, { network })}
            </h2>
            {activity.length === 0 ? (
              <p className="mt-4 text-sm text-muted-foreground">{w.activityEmpty}</p>
            ) : (
              <>
                <ul className="mt-2 divide-y">
                  {activity.slice(0, shown).map((a) => (
                    <ActivityRow key={a.id} record={a} />
                  ))}
                </ul>
                {activity.length > shown ? (
                  <Button variant="ghost" size="sm" className="mt-2" onClick={() => setShown((n) => n + 4)}>
                    {w.more}
                  </Button>
                ) : null}
              </>
            )}
          </section>
        </div>

        <div className="order-1 min-w-0 lg:sticky lg:top-24 lg:order-2">
          <SendCard demo={demo} />
        </div>
      </div>
    </div>
  )
}

function ActivityRow({ record }: { record: TxRecord }) {
  const { app, locale } = useAppCopy()
  const w = app.walletView
  const name = record.counterpartyName ?? shortAddress(record.counterparty)
  const Icon = record.kind === "receive" ? ArrowDownLeftIcon : record.kind === "topup" ? FuelIcon : ArrowUpRightIcon
  const sign = record.kind === "receive" ? "+" : "−"
  const feeLine =
    record.kind === "receive"
      ? null
      : record.kind === "topup"
        ? w.feeFromTank
        : record.route === "sponsored"
          ? w.feeSponsored
        : record.feeAmount !== undefined && record.feeToken
          ? t(w.feePaid, { fee: formatToken(record.feeAmount, record.feeToken, locale) })
          : null

  return (
    <li className="flex items-center gap-3 py-3">
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border bg-secondary" aria-hidden="true">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{t(w.kinds[record.kind], { name })}</p>
        <p className="truncate text-xs text-muted-foreground">
          <time dateTime={record.at} title={`${formatDateTime(record.at, locale)} · #${formatBlock(record.block, locale)}`}>
            {formatRelative(record.at, locale)}
          </time>
          {feeLine ? ` · ${feeLine}` : null}
        </p>
      </div>
      <span className="shrink-0 text-sm font-bold tabular-nums">
        {sign}
        {formatToken(record.amount, record.token, locale)}
      </span>
    </li>
  )
}
