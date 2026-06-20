import { useEffect, useState } from "react"
import * as Icons from "lucide-react"
import { Search, AlertCircle, CheckCircle2, Plus } from "lucide-react"
import { ComponentsApi } from "@/api/components"
import type { Category, Component, CompatibilityResult } from "@/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
  category: Category
  compatibility: CompatibilityResult | null
  buildId?: number
  onSelect: (component: Component) => void
}

const SPEC_TAGS: Record<string, string[]> = {
  cpu:          ["socket", "ddr_support", "tdp_watt"],
  motherboard:  ["socket", "ddr_gen", "form_factor"],
  ram:          ["ddr_gen", "speed_mhz", "capacity_gb"],
  gpu:          ["pcie_version", "length_mm"],
  psu:          ["wattage_max", "certification"],
  case:         ["form_factor"],
  storage:      ["interface", "capacity_gb"],
  "cpu-cooler": ["socket_compat", "max_tdp"],
}

function tagStyle(key: string): string {
  if (["socket", "socket_compat"].includes(key))
    return "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300"
  if (["ddr_gen", "ddr_support"].includes(key))
    return "bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-300"
  if (["speed_mhz", "wattage_max", "max_tdp", "tdp_watt"].includes(key))
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
  if (["form_factor"].includes(key))
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300"
  if (["pcie_version"].includes(key))
    return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300"
  if (["capacity_gb"].includes(key))
    return "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300"
  return "bg-muted text-muted-foreground"
}

function formatSpecValue(key: string, value: string): string {
  if (key === "speed_mhz")                                    return `${value} MHz`
  if (key === "capacity_gb")                                  return `${value} GB`
  if (["wattage_max", "max_tdp", "tdp_watt"].includes(key))  return `${value}W`
  if (key === "length_mm")                                    return `${value}mm`
  return value
}

export default function ComponentBrowser({ category, compatibility, buildId, onSelect }: Props) {
  const [components, setComponents] = useState<Component[]>([])
  const [search, setSearch] = useState("")
  const [onlyCompatible, setOnlyCompatible] = useState(false)
  const [loading, setLoading] = useState(false)

  const Icon = (Icons as Record<string, React.ElementType>)[category.icon] ?? Icons.Box
  const specKeys = SPEC_TAGS[category.slug] ?? []

  const categoryErrors = compatibility?.errors.filter((e) => {
    const map: Record<string, string[]> = {
      R1: ["cpu", "motherboard"], R2: ["ram", "motherboard"], R3: ["psu"],
      R4: ["case", "motherboard"], R5: ["case", "gpu"],
      R6: ["cpu-cooler", "cpu"], R7: ["case", "cpu-cooler"],
    }
    return map[e.rule]?.includes(category.slug)
  }) ?? []

  useEffect(() => {
    setLoading(true)
    setSearch("")

    const filters: { category: string; compatible_with_build?: number } = {
      category: category.slug,
    }
    if (onlyCompatible && buildId) {
      filters.compatible_with_build = buildId
    }

    ComponentsApi.list(filters)
      .then(setComponents)
      .finally(() => setLoading(false))
  }, [category.slug, onlyCompatible])

  const filtered = components.filter((c) =>
    `${c.name} ${c.brand}`.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* header */}
      <div className="px-5 pt-5 pb-4 border-b border-border flex-shrink-0 space-y-3">

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4 text-foreground/60" />
            </div>
            <div>
              <h2 className="text-base font-semibold leading-tight">{category.name}</h2>
              <p className="text-xs text-muted-foreground">
                {loading ? "Caricamento..." : `${filtered.length} ${filtered.length === 1 ? "prodotto" : "prodotti"}`}
              </p>
            </div>
          </div>

          {compatibility && categoryErrors.length === 0 && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Compatibile
            </div>
          )}
        </div>

        {categoryErrors.length > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/8 border border-destructive/25">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
            <div className="text-xs text-destructive space-y-0.5">
              {categoryErrors.map((e) => <p key={e.rule}>{e.message}</p>)}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={`Cerca in ${category.name.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
          <Button
            variant={onlyCompatible ? "default" : "outline"}
            size="sm"
            className="h-9 px-3 text-xs whitespace-nowrap"
            onClick={() => setOnlyCompatible((v) => !v)}
          >
            Solo compatibili
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">

        {loading && (
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-muted-foreground">Nessun componente trovato.</p>
            {search && (
              <button
                className="text-xs text-primary mt-2 hover:underline"
                onClick={() => setSearch("")}
              >
                Cancella ricerca
              </button>
            )}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((component) => (
              <ComponentCard
                key={component.id}
                component={component}
                specKeys={specKeys}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// skeleton caricamento
function SkeletonCard() {
  return (
    <div className="flex border border-border rounded-lg overflow-hidden bg-card animate-pulse">
      <div className="w-20 flex-shrink-0 bg-muted/50 border-r border-border" style={{ minHeight: 100 }} />
      <div className="flex-1 p-3 space-y-2">
        <div className="h-2 bg-muted rounded w-10" />
        <div className="h-3.5 bg-muted rounded w-4/5" />
        <div className="h-3 bg-muted rounded w-3/5" />
        <div className="flex gap-1 pt-1">
          <div className="h-4 bg-muted rounded-full w-12" />
          <div className="h-4 bg-muted rounded-full w-10" />
        </div>
        <div className="flex items-center justify-between pt-1">
          <div className="h-4 bg-muted rounded w-12" />
          <div className="h-6 bg-muted rounded w-16" />
        </div>
      </div>
    </div>
  )
}

// card componente
function ComponentCard({
  component,
  specKeys,
  onSelect,
}: {
  component: Component
  specKeys: string[]
  onSelect: (c: Component) => void
}) {
  const tags = (component.specs ?? []).filter((s) => specKeys.includes(s.spec_key)).slice(0, 3)
  const canAdd = component.stock

  return (
    <div className={cn(
      "group flex flex-col border border-border rounded-lg overflow-hidden bg-card",
      "hover:border-primary/40 hover:shadow-sm transition-all duration-150",
      !canAdd && "opacity-60"
    )}>

      <div className="flex flex-1">

        <div className="w-16 flex-shrink-0 bg-muted/20 border-r border-border flex items-center justify-center p-2 min-h-[80px]">
          {component.image_url ? (
            <img
              src={component.image_url}
              alt={component.name}
              className="max-w-full max-h-full object-contain drop-shadow-sm"
              loading="lazy"
            />
          ) : (
            <span className="text-muted-foreground/20 text-lg select-none">—</span>
          )}
        </div>

        <div className="flex flex-col flex-1 min-w-0 p-2.5 gap-1">
          <p className="text-[10px] text-muted-foreground font-medium tracking-wide leading-none">
            {component.brand}
          </p>
          <p className="text-[12px] font-semibold leading-tight line-clamp-2">
            {component.name}
          </p>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-0.5">
              {tags.map((spec) => (
                <span
                  key={spec.spec_key}
                  className={cn(
                    "text-[9px] px-1.5 py-[2px] rounded-full font-medium",
                    tagStyle(spec.spec_key)
                  )}
                >
                  {formatSpecValue(spec.spec_key, spec.spec_value)}
                </span>
              ))}
            </div>
          )}

          <div className="hidden md:flex items-center justify-between mt-auto pt-1.5">
            <p className="text-sm font-bold tabular-nums text-foreground">
              €{Number(component.price).toFixed(2)}
            </p>
            <button
              onClick={() => canAdd && onSelect(component)}
              disabled={!canAdd}
              title={canAdd ? "Aggiungi" : "Esaurito"}
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0",
                "border transition-all duration-150",
                canAdd
                  ? "border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground hover:border-primary cursor-pointer"
                  : "border-border text-muted-foreground cursor-not-allowed"
              )}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="md:hidden text-sm font-bold tabular-nums text-foreground mt-auto pt-1">
            €{Number(component.price).toFixed(2)}
          </p>
        </div>
      </div>

      <button
        onClick={() => canAdd && onSelect(component)}
        disabled={!canAdd}
        className={cn(
          "md:hidden w-full flex items-center justify-center gap-1.5 py-2 border-t border-border",
          "text-xs font-semibold transition-colors",
          canAdd
            ? "text-primary hover:bg-primary hover:text-primary-foreground cursor-pointer"
            : "text-muted-foreground cursor-not-allowed"
        )}
      >
        {canAdd ? (
          <>
            <Plus className="w-3.5 h-3.5" />
            Aggiungi
          </>
        ) : (
          "Esaurito"
        )}
      </button>
    </div>
  )
}
