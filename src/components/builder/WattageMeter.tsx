import { Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Build, Component } from "@/types"

type Props = {
  build: Build
  psu: Component | null
}

export default function WattageMeter({ build, psu }: Props) {
  const maxWattage = psu?.specs
    ? parseInt(psu.specs.find((s) => s.spec_key === "wattage_max")?.spec_value ?? "0")
    : 0

  const used = build.total_wattage
  const percentage = maxWattage > 0 ? Math.min((used / maxWattage) * 100, 100) : 0
  const recommended = Math.ceil(used / 0.8)

  const isOverload = percentage > 95
  const isHigh = percentage > 80
  const labelColor = isOverload ? "text-destructive" : isHigh ? "text-orange-500" : "text-green-500"
  const barColor = isOverload ? "bg-destructive" : isHigh ? "bg-orange-500" : "bg-green-500"

  return (
    <div className="space-y-2.5">
      {/* Title + value */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <Zap className="w-3 h-3" />
          Wattaggio stimato
        </span>
        <span className={cn("text-sm font-bold tabular-nums", maxWattage > 0 ? labelColor : "text-muted-foreground")}>
          {used}W{maxWattage > 0 ? ` / ${maxWattage}W` : ""}
        </span>
      </div>

      {/* Bar */}
      <div className="relative h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-all duration-500",
            barColor
          )}
          style={{ width: maxWattage > 0 ? `${percentage}%` : "0%" }}
        />
        {/* 80% marker */}
        {maxWattage > 0 && (
          <div
            className="absolute top-0 bottom-0 w-px bg-background/40"
            style={{ left: "80%" }}
          />
        )}
      </div>

      {/* Sub-label */}
      <p className="text-xs text-muted-foreground leading-snug">
        {maxWattage > 0
          ? `${Math.round(percentage)}% della capacità PSU`
          : used > 0
          ? `Nessuna PSU — consigliata almeno ${recommended}W`
          : "Aggiungi componenti per calcolare il wattaggio"
        }
      </p>
    </div>
  )
}
