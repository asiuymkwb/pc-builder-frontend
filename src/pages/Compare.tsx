import { useEffect, useState } from "react"
import { BuildsApi } from "@/api/builds"
import { CategoriesApi } from "@/api/categories"
import type { Build, Category } from "@/types"
import Navbar from "@/components/layout/Navbar"
import { GitCompareArrows } from "lucide-react"

export default function Compare() {
  const [builds, setBuilds]       = useState<Build[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [buildAId, setBuildAId]   = useState<string>("")
  const [buildBId, setBuildBId]   = useState<string>("")
  const [buildA, setBuildA]       = useState<Build | null>(null)
  const [buildB, setBuildB]       = useState<Build | null>(null)
  const [loadingA, setLoadingA]   = useState(false)
  const [loadingB, setLoadingB]   = useState(false)

  // Carica lista build e categorie al mount
  useEffect(() => {
    BuildsApi.list().then(setBuilds)
    CategoriesApi.list().then(setCategories)
  }, [])

  // Carica build A completa quando l'utente ne seleziona una
  useEffect(() => {
    if (!buildAId) { setBuildA(null); return }
    setLoadingA(true)
    BuildsApi.get(Number(buildAId))
      .then(setBuildA)
      .catch(() => setBuildA(null))
      .finally(() => setLoadingA(false))
  }, [buildAId])

  // Carica build B completa quando l'utente ne seleziona una
  useEffect(() => {
    if (!buildBId) { setBuildB(null); return }
    setLoadingB(true)
    BuildsApi.get(Number(buildBId))
      .then(setBuildB)
      .catch(() => setBuildB(null))
      .finally(() => setLoadingB(false))
  }, [buildBId])

  // Per ogni categoria, prende il componente dalla build (se presente)
  const getComponent = (build: Build | null, categorySlug: string) => {
    return build?.components?.find((c) => c.category?.slug === categorySlug) ?? null
  }

  const canCompare = buildA !== null && buildB !== null
  const isLoading  = loadingA || loadingB

  // Determina colore per il confronto del prezzo totale
  const priceColor = (a: number, b: number) => {
    if (a < b) return "text-green-500"
    if (a > b) return "text-destructive"
    return "text-muted-foreground"
  }

  const wattColor = (a: number, b: number) => {
    if (a < b) return "text-green-500"
    if (a > b) return "text-destructive"
    return "text-muted-foreground"
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-semibold">Confronta build</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Seleziona due build per confrontare i componenti scelti
          </p>
        </div>

        {/* Selettori */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Build A</label>
            <select
              value={buildAId}
              onChange={(e) => setBuildAId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Seleziona una build...</option>
              {builds
                .filter((b) => String(b.id) !== buildBId)
                .map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Build B</label>
            <select
              value={buildBId}
              onChange={(e) => setBuildBId(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Seleziona una build...</option>
              {builds
                .filter((b) => String(b.id) !== buildAId)
                .map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
            </select>
          </div>
        </div>

        {/* Stato caricamento */}
        {isLoading && (
          <div className="text-center py-24 text-muted-foreground text-sm">
            Caricamento build...
          </div>
        )}

        {/* Stato vuoto */}
        {!isLoading && !canCompare && (
          <div className="text-center py-24 text-muted-foreground">
            <GitCompareArrows className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Seleziona due build per avviare il confronto</p>
          </div>
        )}

        {/* Tabella confronto */}
        {!isLoading && canCompare && (
          <div className="border border-border rounded-xl overflow-x-auto">
            {/* Header con nomi build */}
            <div className="grid grid-cols-[180px_1fr_1fr] bg-muted/30 border-b border-border">
              <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Categoria
              </div>
              <div className="px-4 py-3 font-semibold text-sm border-l border-border">
                {buildA.name}
              </div>
              <div className="px-4 py-3 font-semibold text-sm border-l border-border">
                {buildB.name}
              </div>
            </div>

            {/* Righe per categoria */}
            {categories.map((category) => {
              const compA = getComponent(buildA, category.slug)
              const compB = getComponent(buildB, category.slug)
              const bothEmpty = !compA && !compB

              if (bothEmpty) return null

              return (
                <div
                  key={category.id}
                  className="grid grid-cols-[180px_1fr_1fr] border-b border-border last:border-b-0 hover:bg-muted/10 transition-colors"
                >
                  {/* Nome categoria */}
                  <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground self-center">
                    {category.name}
                  </div>

                  {/* Componente build A */}
                  <div className="px-4 py-3 border-l border-border">
                    {compA ? (
                      <div>
                        <p className="text-xs text-muted-foreground">{compA.brand}</p>
                        <p className="text-sm font-medium leading-snug">{compA.name}</p>
                        <p className="text-xs font-semibold text-primary mt-0.5">
                          €{Number(compA.price).toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground/40 italic">Non selezionato</p>
                    )}
                  </div>

                  {/* Componente build B */}
                  <div className="px-4 py-3 border-l border-border">
                    {compB ? (
                      <div>
                        <p className="text-xs text-muted-foreground">{compB.brand}</p>
                        <p className="text-sm font-medium leading-snug">{compB.name}</p>
                        <p className="text-xs font-semibold text-primary mt-0.5">
                          €{Number(compB.price).toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground/40 italic">Non selezionato</p>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Riga totali */}
            <div className="grid grid-cols-[180px_1fr_1fr] bg-muted/20 border-t-2 border-border">
              <div className="px-4 py-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground self-center">
                Prezzo totale
              </div>
              <div className="px-4 py-4 border-l border-border">
                <p className={`text-lg font-bold tabular-nums ${priceColor(buildA.total_price, buildB.total_price)}`}>
                  €{Number(buildA.total_price).toFixed(2)}
                </p>
              </div>
              <div className="px-4 py-4 border-l border-border">
                <p className={`text-lg font-bold tabular-nums ${priceColor(buildB.total_price, buildA.total_price)}`}>
                  €{Number(buildB.total_price).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-[180px_1fr_1fr] bg-muted/20 border-t border-border">
              <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground self-center">
                Wattaggio totale
              </div>
              <div className="px-4 py-3 border-l border-border">
                <p className={`text-base font-bold tabular-nums ${wattColor(buildA.total_wattage, buildB.total_wattage)}`}>
                  {buildA.total_wattage}W
                </p>
              </div>
              <div className="px-4 py-3 border-l border-border">
                <p className={`text-base font-bold tabular-nums ${wattColor(buildB.total_wattage, buildA.total_wattage)}`}>
                  {buildB.total_wattage}W
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
