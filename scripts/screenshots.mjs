// Visual check of every page and key flow with Playwright.
// Usage: pnpm build && pnpm start -p 3156   (in another terminal)
//        pnpm screenshots                  (BASE_URL defaults to http://localhost:3156)
// Output: docs/screenshots/<locale>-<width>-<theme>-<name>.png
import { mkdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { chromium } from "playwright"

const BASE = process.env.BASE_URL ?? "http://localhost:3156"
const OUT = fileURLToPath(new URL("../docs/screenshots/", import.meta.url))
const ONLY = process.env.ONLY // optional filter on the variant tag

const sizes = { 390: { width: 390, height: 844 }, 1440: { width: 1440, height: 900 } }
const variants = []
for (const w of [390, 1440]) for (const theme of ["light", "dark"]) variants.push({ locale: "en", w, theme })
// French: home page and one key flow, both widths, light.
for (const w of [390, 1440]) variants.push({ locale: "fr", w, theme: "light" })

const STORE = "flexgas-demo-v1"
const L = {
  en: { connect: "Connect demo wallet", confirm: "Confirm", reject: "Reject", send: "Send", menu: "Open menu", wallet: "Wallet", amount: "Amount" },
  fr: { connect: "Connecter le portefeuille de démo", confirm: "Confirmer", reject: "Refuser", send: "Envoyer", menu: "Ouvrir le menu", wallet: "Portefeuille", amount: "Montant" },
}

async function newPage(browser, { locale, w, theme }) {
  const context = await browser.newContext({
    viewport: sizes[w],
    colorScheme: theme,
    locale: locale === "fr" ? "fr-CA" : "en-CA",
    reducedMotion: "no-preference",
  })
  await context.addInitScript((t) => {
    try {
      window.localStorage.setItem("theme", t)
    } catch {}
  }, theme)
  const page = await context.newPage()
  page.on("pageerror", (e) => console.log("  ! pageerror", e.message))
  return { context, page }
}

const shot = async (page, v, name, fullPage = false) => {
  if (fullPage) {
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y)
        await new Promise((r) => setTimeout(r, 80))
      }
      window.scrollTo(0, 0)
    })
  }
  await page.waitForTimeout(350)
  await page.screenshot({ path: `${OUT}${v.locale}-${v.w}-${v.theme}-${name}.png`, fullPage })
  console.log("  ✓", `${v.locale}-${v.w}-${v.theme}-${name}`)
}

const prompt = (page, v) => page.getByRole("dialog").filter({ has: page.getByRole("button", { name: L[v.locale].confirm, exact: true }) })
const main = (page) => page.getByRole("main")
const sendBtn = (page, v) => main(page).getByRole("button", { name: L[v.locale].send, exact: true })

async function patch(page, fn) {
  await page.evaluate(
    ([key, src]) => {
      const s = JSON.parse(localStorage.getItem(key))
      new Function("s", src)(s)
      localStorage.setItem(key, JSON.stringify(s))
    },
    [STORE, fn]
  )
  await page.reload({ waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1 }).first().waitFor()
}

async function connect(page, v, capture) {
  await page.goto(`${BASE}/${v.locale}/app`, { waitUntil: "networkidle" })
  const btn = main(page).getByRole("button", { name: L[v.locale].connect })
  await btn.waitFor()
  if (capture) await shot(page, v, "app-01-gate", true)
  await btn.click()
  await prompt(page, v).waitFor()
  if (capture) await shot(page, v, "flow1-connect-prompt")
  await prompt(page, v).getByRole("button", { name: L[v.locale].confirm }).click()
  await page.getByRole("heading", { level: 1, name: L[v.locale].wallet }).waitFor({ timeout: 10000 })
}

/** Fill the send form: amount, then a contact. */
async function fill(page, v, amount, contact, token) {
  if (token) await main(page).getByLabel(v.locale === "fr" ? "Jeton" : "Token", { exact: true }).selectOption(token)
  await main(page).getByLabel(L[v.locale].amount, { exact: true }).fill(amount)
  await main(page).getByRole("button", { name: contact }).click()
  await page.waitForTimeout(900) // let the cascade settle
}

async function sendAndConfirm(page, v, name) {
  await sendBtn(page, v).click()
  await prompt(page, v).waitFor()
  await shot(page, v, `${name}-prompt`)
  await prompt(page, v).getByRole("button", { name: L[v.locale].confirm }).click()
  await page.getByText(v.locale === "fr" ? "Envoi en cours…" : "Sending…").first().waitFor()
  await sendBtn(page, v).scrollIntoViewIfNeeded()
  await shot(page, v, `${name}-pending`)
  await main(page).getByRole("button", { name: v.locale === "fr" ? "Nouveau transfert" : "New transfer" }).waitFor({ timeout: 15000 })
  await page.waitForTimeout(900)
  await main(page).getByRole("button", { name: v.locale === "fr" ? "Nouveau transfert" : "New transfer" }).scrollIntoViewIfNeeded()
  await shot(page, v, `${name}-confirmed`)
}

async function marketing(page, v) {
  for (const [name, path] of [
    ["home", ""],
    ["how-it-works", "/how-it-works"],
    ["credits", "/credits"],
    ["pricing", "/pricing"],
    ["404", "/this-page-does-not-exist"],
  ]) {
    await page.goto(`${BASE}/${v.locale}${path}`, { waitUntil: "networkidle" })
    // Let the hero loop reach its confirmed state.
    await page.waitForTimeout(name === "home" ? 4700 : 400)
    await shot(page, v, `page-${name}`, true)
  }
  if (v.w < 768) {
    await page.goto(`${BASE}/${v.locale}`, { waitUntil: "networkidle" })
    await page.getByRole("button", { name: L[v.locale].menu }).click()
    await page.getByRole("dialog").waitFor()
    await shot(page, v, "page-mobile-menu")
  }
}

async function appFlows(page, v) {
  // Flow 1: connect, the rejected variant, connect again.
  await connect(page, v, true)
  await patch(page, "s.wallet.status = 'disconnected'")
  await main(page).getByRole("button", { name: L.en.connect }).click()
  await prompt(page, v).getByRole("button", { name: L.en.reject }).click()
  await page.getByText("You declined the sign-in").waitFor()
  await shot(page, v, "flow1-connect-rejected")
  await main(page).getByRole("button", { name: L.en.connect }).click()
  await prompt(page, v).getByRole("button", { name: L.en.confirm }).click()
  await page.getByRole("heading", { level: 1, name: "Wallet" }).waitFor({ timeout: 10000 })
  await page.waitForTimeout(900)
  await shot(page, v, "app-02-wallet", true)

  // Validation errors.
  await sendBtn(page, v).click()
  await shot(page, v, "flow2-errors")

  // Flow 2: sponsored transfer with zero tETH on Sepolia.
  await fill(page, v, "40", "Café Lumen")
  await main(page).getByText("Who pays the fee").scrollIntoViewIfNeeded()
  await shot(page, v, "flow2-routes-sponsored")
  await sendAndConfirm(page, v, "flow2")

  // Flow 3: stablecoin route on Arbitrum Sepolia (the club doesn't cover it).
  await main(page).getByRole("button", { name: "New transfer" }).click()
  await page.getByRole("radio", { name: "Arbitrum Sepolia" }).click()
  await fill(page, v, "5", "Léa Tremblay", "tDAI")
  await main(page).getByText("How is this calculated?").evaluate((el) => el.scrollIntoView({ block: "start" }))
  await page.mouse.wheel(0, -120)
  await main(page).getByText("How is this calculated?").click()
  await page.waitForTimeout(300)
  await shot(page, v, "flow3-routes-stablecoin")
  await page.keyboard.press("Escape")
  // A failed attempt first, then the real one.
  await patch(page, "s.settings.failNext = true")
  await fill(page, v, "5", "Léa Tremblay", "tDAI")
  await sendBtn(page, v).click()
  await prompt(page, v).getByRole("button", { name: "Confirm" }).click()
  await page.getByText("The network rejected the transaction").waitFor({ timeout: 15000 })
  await page.getByText("The network rejected the transaction").scrollIntoViewIfNeeded()
  await shot(page, v, "flow3-failed")
  await main(page).getByRole("button", { name: "Dismiss" }).click()
  await sendAndConfirm(page, v, "flow3")

  // Blocked: a gas spike on Sepolia with no tETH.
  await patch(page, "s.settings.gasSpike = true; s.prefs.chain = 'sepolia'")
  await fill(page, v, "10", "Amara Okafor")
  await main(page).getByText("No route can pay this fee.").scrollIntoViewIfNeeded()
  await shot(page, v, "flow3-blocked")

  // Flow 4: paymaster offline, native gas fallback on Base Sepolia.
  await patch(page, "s.settings.gasSpike = false; s.settings.paymasterOffline = true; s.prefs.chain = 'base-sepolia'")
  await fill(page, v, "5", "Amara Okafor")
  await main(page).getByText("Who pays the fee").scrollIntoViewIfNeeded()
  await shot(page, v, "flow4-routes-fallback")
  await sendAndConfirm(page, v, "flow4")
  await patch(page, "s.settings.paymasterOffline = false; s.prefs.chain = 'sepolia'")

  // Flow 5: the gas tank: top up, tighten a safeguard, see it in the wallet.
  await page.goto(`${BASE}/${v.locale}/app/tank`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1, name: "Campus Blockchain Club" }).waitFor()
  await shot(page, v, "flow5-tank", true)
  await main(page).getByRole("button", { name: "Top up", exact: true }).click()
  await main(page).getByRole("button", { name: "50", exact: true }).click()
  await shot(page, v, "flow5-topup-form")
  await main(page).locator("form").getByRole("button", { name: "Top up", exact: true }).click()
  await prompt(page, v).waitFor()
  await shot(page, v, "flow5-topup-prompt")
  await prompt(page, v).getByRole("button", { name: "Confirm" }).click()
  await page.getByText(/Tank topped up/).waitFor({ timeout: 15000 })
  await page.waitForTimeout(800)
  await page.evaluate(() => window.scrollTo(0, 0))
  await shot(page, v, "flow5-topped-up")
  await main(page).getByLabel("Sponsored transfers per member per day").fill("1")
  await main(page).getByRole("button", { name: "Save safeguards" }).click()
  await prompt(page, v).getByRole("button", { name: "Confirm" }).click()
  await page.getByText("Saved. Applies to the next transaction.").waitFor({ timeout: 10000 })
  await page.getByText("Saved. Applies to the next transaction.").scrollIntoViewIfNeeded()
  await shot(page, v, "flow5-safeguards-saved")
  await page.goto(`${BASE}/${v.locale}/app`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1, name: "Wallet" }).waitFor()
  await fill(page, v, "10", "Diego Ramirez")
  await main(page).getByText("Who pays the fee").scrollIntoViewIfNeeded()
  await shot(page, v, "flow5-limit-in-wallet")

  await main(page).getByRole("button", { name: "Demo controls" }).click()
  await page.getByRole("dialog").waitFor()
  await shot(page, v, "app-03-demo-controls")
  await page.keyboard.press("Escape")
}

async function frenchFlow(page, v) {
  await page.goto(`${BASE}/fr`, { waitUntil: "networkidle" })
  await page.waitForTimeout(4700)
  await shot(page, v, "page-home", true)
  await page.goto(`${BASE}/fr/how-it-works`, { waitUntil: "networkidle" })
  await shot(page, v, "page-how-it-works", true)
  await connect(page, v, true)
  await page.waitForTimeout(900)
  await shot(page, v, "app-02-wallet", true)
  await page.getByRole("radio", { name: "Arbitrum Sepolia" }).click()
  await fill(page, v, "5", "Léa Tremblay", "tDAI")
  await main(page).getByText("Qui paie les frais").scrollIntoViewIfNeeded()
  await shot(page, v, "flow3-routes-stablecoin")
  await sendAndConfirm(page, v, "flow3")
  await page.goto(`${BASE}/fr/app/tank`, { waitUntil: "networkidle" })
  await page.getByRole("heading", { level: 1 }).first().waitFor()
  await shot(page, v, "flow5-tank", true)
}

const browser = await chromium.launch()
await mkdir(OUT, { recursive: true })
for (const v of variants) {
  const tag = `${v.locale}-${v.w}-${v.theme}`
  if (ONLY && !tag.includes(ONLY)) continue
  console.log(tag)
  const { context, page } = await newPage(browser, v)
  try {
    if (v.locale === "fr") await frenchFlow(page, v)
    else {
      await marketing(page, v)
      await appFlows(page, v)
    }
  } catch (e) {
    console.error("  ✗", tag, e.message)
    await page.screenshot({ path: `${OUT}_error-${tag}.png` }).catch(() => {})
    process.exitCode = 1
  }
  await context.close()
}
await browser.close()
