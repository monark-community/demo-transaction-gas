import { ArrowRightIcon, CheckIcon, MinusIcon, ShieldCheckIcon, UsersIcon } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

import { FeeSplit } from "@/components/diagrams/fee-split"
import { Disclosure } from "@/components/ui/disclosure"
import { SectionDivider } from "@/components/ui/section-divider"
import { SectionHeading } from "@/components/ui/section-heading"
import { Button } from "@/components/ui/button"
import { href, isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { CHAIN_IDS, CHAINS } from "@/lib/demo/network"
import { gasQuote, stableQuote } from "@/lib/demo/routes"
import { createSeed } from "@/lib/demo/seed"
import { formatNumber, formatToken, formatUsd } from "@/lib/format"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/how-it-works">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.how
  return pageMetadata(locale, "/how-it-works", m.title, m.description)
}

const CODE = `import { flexgas } from "@monark/flexgas"

// 1. Ask which routes can pay this transfer's fee.
const plan = await flexgas.routes({ chain, from, call })
// plan.routes: sponsored | stablecoin | native, with reasons

// 2. Show them, then send with the one the user keeps.
const op = await flexgas.send(plan.best, { maxFee: 5 })
// The paymaster settles gas in tETH; the user signs once.`

export default async function HowItWorks({ params }: PageProps<"/[locale]/how-it-works">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const d = getDictionary(locale).how
  const clubChains = createSeed(0).tank.policy.chains
  const settings = { gasSpike: false }
  const q = stableQuote(gasQuote("sepolia", "tUSDC", settings), "tUSDC")

  const rows = [
    { label: d.quote.rows.gas, value: formatNumber(q.units, locale, 0) },
    { label: d.quote.rows.price, value: `${formatNumber(q.gwei, locale, 2)} gwei` },
    { label: d.quote.rows.eth, value: formatToken(q.feeEth, "tETH", locale) },
    { label: d.quote.rows.usd, value: formatUsd(q.feeUsd, locale) },
    { label: d.quote.rows.service, value: formatUsd(q.service, locale) },
  ]

  return (
    <div className="flex flex-col">
      <header className="mx-auto w-full max-w-6xl px-4 pt-12 pb-10 sm:px-6 lg:pt-16">
        <h1 className="text-4xl font-extrabold tracking-display sm:text-5xl">{d.title}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{d.intro}</p>
      </header>

      {/* Which route pays: the cascade */}
      <section aria-labelledby="cascade" className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <SectionHeading titleId="cascade" title={d.cascade.title} />
        <figure className="mt-8 rounded-3xl border bg-card p-6 sm:p-8">
          <ol aria-label={d.cascade.label} className="relative grid gap-8 md:grid-cols-3 md:gap-6">
            <span aria-hidden="true" className="absolute top-5 bottom-5 left-5 w-0.5 bg-primary md:top-5 md:right-[16.66%] md:bottom-auto md:left-[16.66%] md:h-0.5 md:w-auto" />
            {d.cascade.steps.map((step, i) => (
              <li key={step.title} className="relative flex gap-4 md:flex-col md:items-center md:text-center">
                <span className="relative z-10 inline-flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-card text-sm font-extrabold">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-bold">{step.title}</h3>
                  <p className="mt-1 max-w-[28ch] text-sm text-muted-foreground md:mx-auto">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <figcaption className="mt-8 border-t pt-4 text-sm text-muted-foreground">{d.cascade.note}</figcaption>
        </figure>
      </section>

      {/* The stablecoin quote: a worked example */}
      <section aria-labelledby="quote" className="border-y bg-card/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading titleId="quote" title={d.quote.title} lead={d.quote.sub} />
            <dl className="mt-6 divide-y rounded-2xl border bg-card text-sm">
              {rows.map((row) => (
                <div key={row.label} className="flex justify-between gap-4 px-4 py-2.5">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd className="font-mono font-semibold tabular-nums">{row.value}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-4 px-4 py-3 text-base">
                <dt className="font-bold">{d.quote.rows.total}</dt>
                <dd className="font-mono font-extrabold tabular-nums">{formatToken(q.charge, "tUSDC", locale)}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-3xl border bg-card p-6 sm:p-8">
            <FeeSplit
              total={formatToken(q.charge, "tUSDC", locale)}
              converted={formatUsd(q.converted, locale)}
              service={formatUsd(q.service, locale)}
              convertedLabel={d.quote.split.converted}
              serviceLabel={d.quote.split.service}
              ratio={q.converted / q.charge}
              animate={false}
            />
            <p className="mt-6 text-sm text-muted-foreground">{d.quote.note}</p>
          </div>
        </div>
      </section>

      {/* Safeguards */}
      <section aria-labelledby="safeguards" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6">
        <SectionHeading titleId="safeguards" title={d.safeguards.title} />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {[
            { icon: ShieldCheckIcon, ...d.safeguards.you },
            { icon: UsersIcon, ...d.safeguards.sponsors },
          ].map((g) => (
            <div key={g.title} className="rounded-3xl border bg-card p-6">
              <g.icon className="size-7 text-primary" strokeWidth={1.75} aria-hidden="true" />
              <h3 className="mt-4 text-xl font-bold">{g.title}</h3>
              <ul className="mt-3 flex flex-col gap-2">
                {g.items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <CheckIcon className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Networks */}
      <section aria-labelledby="networks" className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
        <SectionHeading titleId="networks" title={d.networks.title} />
        <div className="mt-8 overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead className="border-b text-muted-foreground">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">{d.networks.cols.network}</th>
                <th scope="col" className="px-4 py-3 font-semibold">{d.networks.cols.gas}</th>
                <th scope="col" className="px-4 py-3 font-semibold">{d.networks.cols.fee}</th>
                <th scope="col" className="px-4 py-3 font-semibold">{d.networks.cols.sponsored}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {CHAIN_IDS.map((c) => {
                const g = gasQuote(c, "tUSDC", settings)
                const covered = clubChains.includes(c)
                return (
                  <tr key={c}>
                    <th scope="row" className="px-4 py-3 font-bold">{CHAINS[c].name}</th>
                    <td className="px-4 py-3 font-mono tabular-nums">{formatNumber(g.gwei, locale, 2)} gwei</td>
                    <td className="px-4 py-3 font-mono tabular-nums">≈ {formatUsd(g.feeUsd, locale)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5">
                        {covered ? <CheckIcon className="size-4 text-success" aria-hidden="true" /> : <MinusIcon className="size-4 text-muted-foreground" aria-hidden="true" />}
                        {covered ? d.networks.yes : d.networks.no}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* For developers */}
      <section aria-labelledby="dev" className="border-t bg-card/60">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <SectionHeading titleId="dev" title={d.dev.title} lead={d.dev.body} />
          <Disclosure
            className="mt-6"
            contentClassName="p-0"
            summary={
              <>
                <span className="group-data-[state=open]/disclosure:hidden">{d.dev.show}</span>
                <span className="hidden group-data-[state=open]/disclosure:inline">{d.dev.hide}</span>
              </>
            }
          >
            <pre className="overflow-x-auto px-5 py-4 font-mono text-xs leading-relaxed sm:text-sm">
              <code>{CODE}</code>
            </pre>
          </Disclosure>
        </div>
      </section>

      <SectionDivider contained />

      <section className="mx-auto w-full max-w-6xl px-4 py-16 text-center sm:px-6 lg:py-20">
        <h2 className="text-3xl font-extrabold tracking-display sm:text-4xl">{d.cta.title}</h2>
        <Button asChild size="lg" className="mt-8">
          <Link href={href(locale, "/app")}>
            {d.cta.cta}
            <ArrowRightIcon aria-hidden="true" />
          </Link>
        </Button>
      </section>
    </div>
  )
}
