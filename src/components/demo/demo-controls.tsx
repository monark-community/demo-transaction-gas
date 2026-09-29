"use client"

import { RotateCcwIcon, SlidersHorizontalIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { resetDemo, setSettings, useDemo } from "@/lib/demo/store"
import type { DemoSettings } from "@/lib/demo/types"

import { useAppCopy } from "./app-provider"

/**
 * The app bar's one demo element: a pill that opens the demo controls
 * (network speed, forced failure, gas spike, paymaster outage, reset).
 */
export function DemoControls() {
  const demo = useDemo()
  const { app } = useAppCopy()
  const c = app.controls
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  if (!demo) return null

  const switches: { key: keyof DemoSettings; label: string; hint: string }[] = [
    { key: "gasSpike", label: c.spike, hint: c.spikeHint },
    { key: "paymasterOffline", label: c.offline, hint: c.offlineHint },
    { key: "slow", label: c.slow, hint: c.slowHint },
    { key: "failNext", label: c.failNext, hint: c.failNextHint },
  ]
  const active = switches.filter((s) => demo.settings[s.key]).length

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setConfirming(false)
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" title={c.open} className="px-2.5 sm:px-3">
          <SlidersHorizontalIcon aria-hidden="true" />
          <span className="sr-only sm:not-sr-only">{c.open}</span>
          {active ? (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-warning px-1.5 text-xs font-bold text-background">
              {active}
            </span>
          ) : null}
        </Button>
      </DialogTrigger>
      <DialogContent closeLabel={app.close} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-extrabold">{c.title}</DialogTitle>
          <DialogDescription className="sr-only">{c.resetHint}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col divide-y rounded-2xl border">
          {switches.map((s) => (
            <div key={s.key} className="flex items-center justify-between gap-4 px-4 py-3">
              <div>
                <Label htmlFor={`ctl-${s.key}`} className="text-sm font-bold">
                  {s.label}
                </Label>
                <p className="mt-0.5 text-xs text-muted-foreground">{s.hint}</p>
              </div>
              <Switch id={`ctl-${s.key}`} checked={demo.settings[s.key]} onCheckedChange={(v) => setSettings({ [s.key]: v })} />
            </div>
          ))}
        </div>
        <div className="rounded-2xl border p-4">
          {!confirming ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">{c.resetHint}</p>
              <Button variant="destructive" size="sm" onClick={() => setConfirming(true)} className="shrink-0">
                <RotateCcwIcon aria-hidden="true" />
                {c.reset}
              </Button>
            </div>
          ) : (
            <div role="alertdialog" aria-labelledby="reset-q" className="flex flex-col gap-3">
              <p id="reset-q" className="font-bold">
                {c.resetConfirm}
              </p>
              <p className="text-xs text-muted-foreground">{c.resetConfirmBody}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  autoFocus
                  onClick={() => {
                    resetDemo()
                    setConfirming(false)
                    setOpen(false)
                    toast.success(c.resetDone)
                  }}
                >
                  {c.resetDo}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                  {c.cancel}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
