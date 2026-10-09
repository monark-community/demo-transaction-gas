"use client"

import Image from "next/image"

import { WalletPrompt as MonarkWalletPrompt } from "@/components/ui/wallet-prompt"
import { CHAINS } from "@/lib/demo/network"
import { useDemo, usePrompt } from "@/lib/demo/store"

import { useAppCopy } from "./app-provider"

/**
 * The simulated wallet's confirmation sheet (@monark/ui wallet-prompt). It
 * shows who pays the fee (the route FlexGas selected) and, for anything that
 * moves value, the testnet notice: once per transaction, here only. Closing
 * it counts as a rejection.
 */
export function WalletPrompt() {
  const prompt = usePrompt()
  const demo = useDemo()
  const { app, disclaimer } = useAppCopy()
  const p = app.prompt
  const summary = prompt?.summary
  const chain = summary?.chain ?? demo?.prefs.chain ?? "sepolia"

  return (
    <MonarkWalletPrompt
      open={!!prompt}
      onConfirm={() => prompt?.resolve(true)}
      onReject={() => prompt?.resolve(false)}
      site={
        <>
          <Image src="/brand/monark-mark.svg" alt="" width={20} height={20} unoptimized />
          {p.site}
        </>
      }
      title={summary?.title ?? p.title}
      description={p.title}
      account={demo ? { name: demo.wallet.name, address: demo.wallet.address } : undefined}
      rows={summary?.rows}
      network={CHAINS[chain].name}
      // FlexGas's fee is a sentence ("Sponsored by …", "0.42 tUSDC, quote locked"), not a raw figure.
      fee={!summary?.noFee && summary?.fee ? <span className="font-sans text-sm font-bold">{summary.fee}</span> : undefined}
      disclaimer={summary?.movesValue ? disclaimer : p.simulated}
      warning={!!summary?.movesValue}
      confirmLabel={p.confirm}
      rejectLabel={p.reject}
      networkLabel={p.network}
      feeLabel={p.fee}
      closeLabel={app.close}
    />
  )
}
