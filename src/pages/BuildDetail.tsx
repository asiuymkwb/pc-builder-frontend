import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router"
import { BuildsApi } from "@/api/builds"
import { QuotesApi } from "@/api/quotes"
import { CategoriesApi } from "@/api/categories"
import type { Build, Category, CompatibilityResult } from "@/types"
import Navbar from "@/components/layout/Navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft, FileText, Pencil, CheckCircle2,
  AlertTriangle, Zap,
} from "lucide-react"
import * as Icons from "lucide-react"

export default function BuildDetail() {
  const { buildId } = useParams<{ buildId: string }>()
  const navigate = useNavigate()

  const [build, setBuild]             = useState<Build | null>(null)
  const [categories, setCategories]   = useState<Category[]>([])
  const [compatibility, setCompatibility] = useState<CompatibilityResult | null>(null)
  const [loading, setLoading]         = useState(true)
  const [downloading, setDownloading] = useState(false)

  useEffect(() => {
    if (!buildId) return

    Promise.all([
      BuildsApi.get(Number(buildId)),
      CategoriesApi.list(),
    ])
      .then(([b, cats]) => {
        setBuild(b)
        setCategories(cats)
        if (b.components && b.components.length > 0) {
          return BuildsApi.checkCompatibility(Number(buildId)).then(setCompatibility)
        }
      })
      .catch(() => navigate("/builds"))
      .finally(() => setLoading(false))
  }, [buildId])

  const handleDownloadPdf = async () => {
    if (!build) return
    setDownloading(true)
    try {
      await QuotesApi.downloadPdf(build.id, build.name)
    } catch (err) {
      console.error("Errore generazione PDF:", err)
    } finally {
      setDownloading(false)
    }
  }

  const psu = build?.components?.find((c) => c.category?.slug === "psu")
  const psuWatt = parseInt(
    psu?.specs?.find((s) => s.spec_key === "wattage_max")?.spec_value ?? "0"
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
          Caricamento build...
        </div>
      </div>
    )
  }

  if (!build) return null

  type BuildComponent = NonNullable<typeof build.components>[number]
  const componentsByCategory: Record<string, BuildComponent> = {}
  for (const c of build.components ?? []) {
    if (c.category?.slug) componentsByCategory[c.category.slug] = c
  }

  const hasErrors   = (compatibility?.errors.length ?? 0) > 0
  const hasWarnings = (compatibility?.warnings.length ?? 0) > 0

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* Breadcrumb */}
        <button
          onClick={() => navigate("/builds")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Le mie build
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">{build.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(build.created_at).toLocaleDateString("it-IT", {
                day: "numeric", month: "long", year: "numeric",
              })}
              {" · "}
              {build.components?.length ?? 0} componenti
            </p>
          </div>

          <div className="flex gap-2 flex-shrink-0 flex-wrap">
            <Button variant="outline" onClick={() => navigate(`/builder/${build.id}`)}>
              <Pencil className="w-4 h-4" />
              Modifica
            </Button>
            <Button onClick={handleDownloadPdf} disabled={downloading}>
              <FileText className="w-4 h-4" />
              {downloading ? "Generazione..." : "Esporta PDF"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ── Lista componenti (2/3) ── */}
          <div className="md:col-span-2 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
              Componenti
            </h2>

            {categories.map((category) => {
              const component = componentsByCategory[category.slug]
              if (!component) return null

              const Icon = (Icons as unknown as Record<string, React.ElementType>)[category.icon] ?? Icons.Box

              return (
                <div
                  key={category.id}
                  className="flex items-center gap-4 p-4 border border-border rounded-xl bg-card"
                >
                  {/* Immagine */}
                  <div className="w-16 h-14 flex-shrink-0 bg-muted/50 rounded-lg flex items-center justify-center overflow-hidden">
                    {component.image_url ? (
                      <img
                        src={component.image_url}
                        alt={component.name}
                        className="max-w-full max-h-full object-contain p-1"
                      />
                    ) : (
                      <Icon className="w-6 h-6 text-muted-foreground/30" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <Badge variant="secondary" className="text-[10px] py-0">
                        {category.name}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{component.brand}</p>
                    <p className="text-sm font-medium leading-tight truncate">{component.name}</p>
                  </div>

                  {/* Prezzo */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-base font-bold tabular-nums">
                      €{Number(component.price).toFixed(2)}
                    </p>
                    {component.wattage > 0 && (
                      <p className="text-xs text-muted-foreground">{component.wattage}W</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Sidebar destra (1/3) ── */}
          <div className="space-y-4">

            {/* Totale */}
            <div className="border border-border rounded-xl bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Totale build
              </p>
              <p className="text-3xl font-bold text-primary tabular-nums">
                €{Number(build.total_price).toFixed(2)}
              </p>

              <Separator className="my-4" />

              {/* Wattaggio */}
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Wattaggio
                </span>
              </div>
              <p className="text-lg font-bold tabular-nums">{build.total_wattage}W</p>
              {psuWatt > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  PSU: {psuWatt}W · {Math.round((1 - build.total_wattage / psuWatt) * 100)}% di riserva
                </p>
              )}
            </div>

            {/* Compatibilità */}
            <div className="border border-border rounded-xl bg-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Compatibilità
              </p>

              {!compatibility && (
                <p className="text-xs text-muted-foreground">Nessuna verifica disponibile.</p>
              )}

              {compatibility && !hasErrors && !hasWarnings && (
                <div className="flex items-center gap-2 text-green-500">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-sm font-medium">Tutto compatibile</span>
                </div>
              )}

              {compatibility?.errors.map((e) => (
                <div key={e.rule} className="flex items-start gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-destructive leading-snug">{e.message}</p>
                </div>
              ))}

              {compatibility?.warnings.map((w) => (
                <div key={w.rule} className="flex items-start gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-500 leading-snug">{w.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
