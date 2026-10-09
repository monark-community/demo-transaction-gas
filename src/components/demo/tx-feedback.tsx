"use client"

import { TxFeedback as MonarkTxFeedback } from "@/components/ui/tx-feedback"
import type { TxState } from "@/lib/demo/types"

import { useAppCopy } from "./app-provider"

/**
 * One transaction's visible lifecycle (@monark/ui tx-feedback) with the
 * demo's copy: signing -> pending (hash) -> confirmed, or failed with a
 * plain-language reason and a retry.
 */
export function TxFeedback({
  state,
  pendingLabel,
  confirmedLabel,
  onRetry,
  onDismiss,
  className,
}: {
  state: TxState
  pendingLabel?: string
  confirmedLabel?: string
  onRetry?: () => void
  onDismiss?: () => void
  className?: string
}) {
  const { app } = useAppCopy()
  const tx = app.tx

  return (
    <MonarkTxFeedback
      phase={state.phase}
      hash={state.hash}
      error={state.error}
      onRetry={onRetry}
      onDismiss={onDismiss}
      signingLabel={tx.signing}
      pendingLabel={pendingLabel ?? tx.pending}
      pendingStatusLabel={tx.pending}
      confirmedLabel={confirmedLabel ?? tx.confirmed}
      failedLabel={tx.failed}
      reasons={{ rejected: tx.rejected, reverted: tx.reverted }}
      retryLabel={tx.retry}
      dismissLabel={tx.dismiss}
      className={className}
    />
  )
}
