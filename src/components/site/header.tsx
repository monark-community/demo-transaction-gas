"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { DemoChip } from "@/components/ui/demo-chip"
import { HeaderAction } from "@/components/ui/header-action"
import { LocaleSwitch } from "@/components/ui/locale-switch"
import { SiteBrand } from "@/components/ui/site-brand"
import { SiteHeader as MonarkSiteHeader } from "@/components/ui/site-header"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { href, locales, switchLocalePath, type Locale } from "@/i18n/config"
import { useDemo } from "@/lib/demo/store"
import { connectWallet, disconnectWallet } from "@/lib/demo/wallet"

/** The header's strings, picked from the dictionary by the (server) layout. */
export interface HeaderCopy {
  product: string
  homeLabel: string
  nav: { label: string; overview: string; how: string; demo: string }
  menu: string
  closeMenu: string
  menuTitle: string
  launchDemo: string
  demoChip: string
  demoBadge: string
  theme: string
  language: { label: string; names: Record<Locale, string>; short: Record<Locale, string> }
  wallet: {
    connect: string
    connecting: string
    disconnect: string
    signIn: string
    signInRow: string
    signInValue: string
  }
}

/**
 * The standard Monark shell header (@monark/ui site-header), wired to the
 * demo's routes, locale and simulated wallet:
 * [mark] {Product}  links…            (• Demo) (EN|FR) (☾) [Primary action]
 */
export function SiteHeader({ locale, copy }: { locale: Locale; copy: HeaderCopy }) {
  const pathname = usePathname() ?? `/${locale}`
  const demo = useDemo()
  const appHref = href(locale, "/app")
  const w = copy.wallet

  return (
    <MonarkSiteHeader
      brand={<SiteBrand name={copy.product} href={href(locale)} aria-label={copy.homeLabel} LinkComponent={Link} />}
      links={[
        { href: href(locale), label: copy.nav.overview, exact: true },
        { href: href(locale, "/how-it-works"), label: copy.nav.how },
        { href: appHref, label: copy.nav.demo },
      ]}
      pathname={pathname}
      LinkComponent={Link}
      labels={{ nav: copy.nav.label, openMenu: copy.menu, closeMenu: copy.closeMenu, menu: copy.menuTitle }}
      actions={
        <>
          <DemoChip label={copy.demoChip} description={copy.demoBadge} />
          <LocaleSwitch
            locales={locales}
            current={locale}
            hrefFor={(l) => switchLocalePath(pathname, l)}
            labels={copy.language}
            LinkComponent={Link}
            linkProps={{ prefetch: false }}
          />
          <ThemeToggle label={copy.theme} />
        </>
      }
      primaryAction={
        <HeaderAction
          appHref={appHref}
          pathname={pathname}
          launchLabel={copy.launchDemo}
          LinkComponent={Link}
          loading={!demo}
          wallet={{
            status: demo?.wallet.status,
            address: demo?.wallet.address,
            name: demo?.wallet.name,
            connectLabel: w.connect,
            connectingLabel: w.connecting,
            disconnectLabel: w.disconnect,
            onConnect: () =>
              void connectWallet({
                title: w.signIn,
                rows: [{ label: w.signInRow, value: w.signInValue }],
                movesValue: false,
                noFee: true,
              }),
            onDisconnect: disconnectWallet,
          }}
        />
      }
    />
  )
}
