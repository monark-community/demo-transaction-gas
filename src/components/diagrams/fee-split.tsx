import { cn } from "@/lib/utils"

/**
 * Signature moment: a stablecoin fee splitting in two. The bar is the whole
 * charge; it parts into the share converted to tETH for the network (orange)
 * and the service margin (brown), each labelled. Animates once on mount.
 */
export function FeeSplit({
  total,
  converted,
  service,
  convertedLabel,
  serviceLabel,
  ratio,
  animate = true,
  className,
}: {
  total: string
  converted: string
  service: string
  convertedLabel: string
  serviceLabel: string
  /** Converted share of the total, 0..1. */
  ratio: number
  animate?: boolean
  className?: string
}) {
  const pct = Math.min(96, Math.max(60, ratio * 100))
  return (
    <figure className={cn("flex flex-col gap-2", className)}>
      <figcaption className="text-2xl font-extrabold tabular-nums tracking-display">{total}</figcaption>
      <div className={cn("fg-split flex h-3 w-full", animate && "fg-split-animate")} aria-hidden="true">
        <span className="h-full rounded-l-full rounded-r-sm bg-primary" style={{ width: `${pct}%` }} />
        <span className="fg-split-gap h-full shrink-0" />
        <span className="h-full flex-1 rounded-l-sm rounded-r-full bg-chart-3" />
      </div>
      <dl className={cn("grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm", animate && "fg-in [animation-delay:350ms]")}>
        <dt className="flex items-center gap-2 text-muted-foreground">
          <span className="size-2.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          {convertedLabel}
        </dt>
        <dd className="text-right font-bold tabular-nums">{converted}</dd>
        <dt className="flex items-center gap-2 text-muted-foreground">
          <span className="size-2.5 shrink-0 rounded-full bg-chart-3" aria-hidden="true" />
          {serviceLabel}
        </dt>
        <dd className="text-right font-bold tabular-nums">{service}</dd>
      </dl>
    </figure>
  )
}
