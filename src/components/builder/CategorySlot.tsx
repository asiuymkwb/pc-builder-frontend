import { X } from "lucide-react"
import * as Icons from "lucide-react"
import type { Category, Component, CompatibilityResult } from "@/types"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
  category: Category
  component: Component | null
  isSelected: boolean
  compatibility: CompatibilityResult | null
  onClick: () => void
  onRemove: () => void
}

function getCategoryStatus(
  slug: string,
  component: Component | null,
  compatibility: CompatibilityResult | null
): "empty" | "ok" | "warning" | "error" {
  if (!component) return "empty"
  if (!compatibility) return "ok"

  const ruleCategories: Record<string, string[]> = {
    R1: ["cpu", "motherboard"],
    R2: ["ram", "motherboard"],
    R3: ["psu"],
    R4: ["case", "motherboard"],
    R5: ["case", "gpu"],
    R6: ["cpu-cooler", "cpu"],
    R7: ["case", "cpu-cooler"],
    W1: ["ram", "cpu"],
    W2: ["cpu-cooler", "cpu"],
  }

  const hasError = compatibility.errors.some((e) => ruleCategories[e.rule]?.includes(slug))
  if (hasError) return "error"

  const hasWarning = compatibility.warnings.some((w) => ruleCategories[w.rule]?.includes(slug))
  if (hasWarning) return "warning"

  return "ok"
}

export default function CategorySlot({
  category, component, isSelected, compatibility, onClick, onRemove,
}: Props) {
  const Icon = (Icons as any)[category.icon] || Icons.Box
  const status = getCategoryStatus(category.slug, component, compatibility)

  let iconColor = "text-muted-foreground/40"
  if (status === "error") iconColor = "text-destructive"
  else if (status === "warning") iconColor = "text-yellow-500"
  else if (component || isSelected) iconColor = "text-primary"

  return (
    <div
      className={cn(
        "group flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors rounded-md",
        isSelected
          ? "bg-accent text-accent-foreground"
          : "hover:bg-muted/50"
      )}
      onClick={onClick}
    >
      {/* Icona */}
      <Icon className={cn("w-4 h-4 flex-shrink-0 transition-colors", iconColor)} />

      {/* Testo */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-xs font-medium leading-none mb-1",
          isSelected ? "text-foreground" : "text-muted-foreground"
        )}>
          {category.name}
        </p>
        {component ? (
          <p className="text-sm font-medium truncate leading-tight">{component.name}</p>
        ) : (
          <p className="text-sm text-muted-foreground/50 leading-tight">-</p>
        )}
      </div>

      {/* Prezzo + rimuovi */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {component ? (
          <>
            <span className="text-xs font-medium text-muted-foreground tabular-nums">
              €{Number(component.price).toFixed(0)}
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => { e.stopPropagation(); onRemove() }}
            >
              <X className="w-3 h-3" />
            </Button>
          </>
        ) : null}
      </div>
    </div>
  )
}
