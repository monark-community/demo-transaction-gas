"use client"

import { SlidersHorizontalIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { DemoControls as MonarkDemoControls, DemoControlsToggle } from "@/components/ui/demo-controls"
import { resetDemo, setSettings, useDemo } from "@/lib/demo/store"
import type { DemoSettings } from "@/lib/demo/types"

import { useAppCopy } from "./app-provider"

/**
 * The app bar's one demo element (@monark/ui demo-controls): slow network,
 * forced failure, plus FlexGas's gas spike and paymaster outage, and reset.
 * The trigger keeps its visible label and a count of armed faults.
 */
export function DemoControls() {
  const demo = useDemo()
  const { app } = useAppCopy()
  const c = app.controls
  if (!demo) return null

  const s = demo.settings
  const set = (key: keyof DemoSettings) => (v: boolean) => setSettings({ [key]: v })
  const active = [s.gasSpike, s.paymasterOffline, s.slow, s.failNext].filter(Boolean).length

  return (
    <MonarkDemoControls
      trigger={
        <Button variant="outline" size="sm" title={c.open} className="px-2.5 sm:px-3">
          <SlidersHorizontalIcon aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">{c.open}</span>
          {active ? (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-warning px-1.5 text-xs font-bold text-background">
              {active}
            </span>
          ) : null}
        </Button>
      }
      slow={s.slow}
      onSlowChange={set("slow")}
      failNext={s.failNext}
      onFailNextChange={set("failNext")}
      onReset={() => {
        resetDemo()
        toast.success(c.resetDone)
      }}
      title={c.title}
      openLabel={c.open}
      slowLabel={c.slow}
      slowHint={c.slowHint}
      failNextLabel={c.failNext}
      failNextHint={c.failNextHint}
      resetLabel={c.reset}
      resetHint={c.resetHint}
      resetConfirmTitle={c.resetConfirm}
      resetConfirmBody={c.resetConfirmBody}
      resetConfirmLabel={c.resetDo}
      cancelLabel={c.cancel}
      closeLabel={app.close}
    >
      <DemoControlsToggle id="ctl-gasSpike" label={c.spike} hint={c.spikeHint} checked={s.gasSpike} onCheckedChange={set("gasSpike")} />
      <DemoControlsToggle
        id="ctl-paymasterOffline"
        label={c.offline}
        hint={c.offlineHint}
        checked={s.paymasterOffline}
        onCheckedChange={set("paymasterOffline")}
      />
    </MonarkDemoControls>
  )
}
