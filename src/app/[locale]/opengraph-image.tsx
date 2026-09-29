import { readFile } from "node:fs/promises"
import { join } from "node:path"

import { ImageResponse } from "next/og"

import { isLocale, locales } from "@/i18n/config"
import { getDictionary } from "@/i18n"

export const alt = "FlexGas by Monark"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params
  const locale = isLocale(raw) ? raw : "en"
  const d = getDictionary(locale)
  const c = d.home.card
  const mark = await readFile(join(process.cwd(), "public/brand/monark-mark.svg"), "utf8")
  const markSrc = `data:image/svg+xml;base64,${Buffer.from(mark).toString("base64")}`
  const muted = "#625952"
  const rows: { title: string; note: string; state: "chosen" | "ok" | "skipped" }[] = [
    { title: c.sponsored, note: c.paidBySponsor, state: "chosen" },
    { title: c.stablecoin, note: locale === "fr" ? "1,92 tUSDC" : "1.92 tUSDC", state: "ok" },
    { title: c.native, note: c.noNative, state: "skipped" },
  ]

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#FFF9F3", color: "#15110E", padding: 72, gap: 56 }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 600 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={markSrc} width={64} height={64} alt="" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 44, fontWeight: 800, lineHeight: 1 }}>FlexGas</span>
              <span style={{ fontSize: 22, color: muted, marginTop: 6 }}>{d.common.byMonark}</span>
            </div>
          </div>
          <div style={{ fontSize: 58, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1.5 }}>{d.meta.ogTagline}</div>
          <div style={{ fontSize: 22, color: muted }}>{d.common.demoBadge}</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 420,
            alignSelf: "center",
            background: "#FFFEFC",
            border: "2px solid #E9DFD7",
            borderRadius: 32,
            padding: 32,
            gap: 16,
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 800 }}>{c.send}</span>
          <span style={{ fontSize: 18, color: muted, fontWeight: 700 }}>{c.routes}</span>
          {rows.map((r) => (
            <div
              key={r.title}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "10px 12px",
                borderRadius: 16,
                background: r.state === "chosen" ? "#F7ECE4" : "transparent",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  display: "flex",
                  background: r.state === "chosen" ? "#F88D10" : "#FFFEFC",
                  border: r.state === "chosen" ? "none" : r.state === "ok" ? "3px solid #857F7A" : "2px dashed #857F7A",
                }}
              />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: 21, fontWeight: 800, color: r.state === "skipped" ? muted : "#15110E" }}>{r.title}</span>
                <span style={{ fontSize: 16, color: muted }}>{r.note}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    size
  )
}
