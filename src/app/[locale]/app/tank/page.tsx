import type { Metadata } from "next"

import { TankView } from "@/components/demo/tank-view"
import { isLocale } from "@/i18n/config"
import { getDictionary } from "@/i18n"
import { pageMetadata } from "@/lib/metadata"

export async function generateMetadata({ params }: PageProps<"/[locale]/app/tank">): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const m = getDictionary(locale).meta.pages.tank
  return pageMetadata(locale, "/app/tank", m.title, m.description)
}

export default function TankPage() {
  return <TankView />
}
