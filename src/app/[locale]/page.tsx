import { ArrowRightIcon, CheckIcon, ChevronDownIcon, CoinsIcon, FuelIcon, HandHeartIcon, TimerIcon } from "lucide-react"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

import { HeroCard } from "@/components/home/hero-card"
import { SectionDivider } from "@/components/site/section-divider"
import { Button } from "@/components/ui/button"
import { href, isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { formatNumber, formatToken } from "@/lib/format"
import { pageMetadata } from "@/lib/metadata"
import { PHOTOS } from "@/lib/photos"

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const d = getDictionary(locale).meta
  return pageMetadata(locale, "/", null, d.description)
}

export default async function Home({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const h = getDictionary(locale).home
  const r = h.routes

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden dark:bg-[radial-gradient(ellipse_at_70%_40%,color-mix(in_oklch,var(--card),transparent_40%),transparent_70%)]">
        <Image
          src="/brand/monark-mesh.svg"
          alt=""
          width={569}
          height={571}
          unoptimized
          priority
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 -right-44 w-[34rem] max-w-none opacity-[0.10] select-none sm:-right-24 lg:-top-10 lg:-right-16 lg:w-[46rem] dark:opacity-[0.16]"
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pt-12 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center lg:gap-14 lg:pt-20 lg:pb-24">
          <div>
            <h1 className="text-[2.25rem] leading-[1.05] font-extrabold tracking-display sm:text-5xl lg:text-[4rem]">{h.title}</h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">{h.sub}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={href(locale, "/app")}>
                  {h.ctaPrimary}
                  <ArrowRightIcon aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={href(locale, "/how-it-works")}>{h.ctaSecondary}</Link>
              </Button>
            </div>
          </div>
          <HeroCard
            copy={h.card}
            stableFee={formatToken(1.916, "tUSDC", locale)}
            amounts={[formatNumber(120, locale, 2, 2), formatNumber(80, locale, 2, 2), formatNumber(38.084, locale, 3, 2)]}
          />
        </div>
      </section>

      {/* 1. Three ways a fee gets paid: each shown with a fragment of real UI */}
      <section aria-labelledby="routes" className="border-y bg-card/60">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 id="routes" className="text-3xl font-bold tracking-display sm:text-[2rem]">
            {r.title}
          </h2>
          <ol className="mt-10 grid gap-5 lg:grid-cols-3">
            <li className="flex flex-col rounded-3xl border bg-card p-6">
              <HandHeartIcon className="size-7 text-primary" strokeWidth={1.75} aria-hidden="true" />
              <h3 className="mt-4 text-xl font-bold">{r.sponsored.title}</h3>
              <p className="mt-2 text-muted-foreground">{r.sponsored.body}</p>
              <p aria-hidden="true" className="mt-auto pt-6">
                <span className="inline-flex items-center gap-2 rounded-full border bg-muted/60 py-1 pr-3 pl-1 text-sm font-bold">
                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary">
                    <CheckIcon className="size-3.5 text-primary-foreground" strokeWidth={3} />
                  </span>
                  {r.sponsored.chip}
                </span>
              </p>
            </li>
            <li className="flex flex-col rounded-3xl border bg-card p-6">
              <CoinsIcon className="size-7 text-primary" strokeWidth={1.75} aria-hidden="true" />
              <h3 className="mt-4 text-xl font-bold">{r.stablecoin.title}</h3>
              <p className="mt-2 text-muted-foreground">{r.stablecoin.body}</p>
              <p aria-hidden="true" className="mt-auto flex flex-wrap items-center gap-2 pt-6">
                <span className="rounded-full border bg-muted/60 px-3 py-1 text-sm font-bold tabular-nums">{r.stablecoin.chip}</span>
                <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold text-muted-foreground tabular-nums">
                  <TimerIcon className="size-3.5" />
                  {r.stablecoin.timer}
                </span>
              </p>
            </li>
            <li className="flex flex-col rounded-3xl border bg-card p-6">
              <FuelIcon className="size-7 text-primary" strokeWidth={1.75} aria-hidden="true" />
              <h3 className="mt-4 text-xl font-bold">{r.native.title}</h3>
              <p className="mt-2 text-muted-foreground">{r.native.body}</p>
              <p aria-hidden="true" className="mt-auto pt-6">
                <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/60 px-3 py-1 text-sm font-bold tabular-nums">
                  <FuelIcon className="size-3.5 text-primary" />
                  {r.native.chip}
                </span>
              </p>
            </li>
          </ol>
        </div>
      </section>

      {/* 2. Who it's for */}
      <section aria-labelledby="who" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <h2 id="who" className="max-w-2xl text-3xl font-bold tracking-display sm:text-[2rem]">
          {h.who.title}
        </h2>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {h.who.items.map((item, i) => {
            const photo = PHOTOS[i]!
            return (
              <li key={item.title} className="flex flex-col overflow-hidden rounded-3xl border bg-card">
                <div className="relative aspect-[4/3]">
                  <Image src={photo.file} alt={item.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-muted-foreground">{item.body}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      {/* 3. FAQ: the only one on the site */}
      <section aria-labelledby="faq" className="border-t bg-card/60">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
          <h2 id="faq" className="text-3xl font-bold tracking-display sm:text-[2rem]">
            {h.faq.title}
          </h2>
          <div className="mt-8 divide-y rounded-3xl border bg-card">
            {h.faq.items.map((item) => (
              <details key={item.q} className="group px-5">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 font-bold [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDownIcon className="size-5 shrink-0 transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
                </summary>
                <p className="max-w-[68ch] pb-5 text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* 4. Closing */}
      <section className="mx-auto w-full max-w-6xl px-4 py-16 text-center sm:px-6 lg:py-24">
        <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-display sm:text-4xl">{h.closing.title}</h2>
        <Button asChild size="lg" className="mt-8">
          <Link href={href(locale, "/app")}>
            {h.closing.cta}
            <ArrowRightIcon aria-hidden="true" />
          </Link>
        </Button>
      </section>
    </>
  )
}
