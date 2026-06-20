import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router"
import { BuildsApi } from "@/api/builds"
import { CategoriesApi } from "@/api/categories"
import { useAuth } from "@/context/AuthContext"
import type { Build, Category, CompatibilityResult, Component } from "@/types"
import Navbar from "@/components/layout/Navbar"
import CategorySlot from "@/components/builder/CategorySlot"
import ComponentBrowser from "@/components/builder/ComponentBrowser"
import CompatibilityPanel from "@/components/builder/CompatibilityPanel"
import WattageMeter from "@/components/builder/WattageMeter"
import BuildSummary from "@/components/builder/BuildSummary"
import LoginPromptModal from "@/components/builder/LoginPromptModal"
import { Cpu, LogIn, List, Search, BarChart2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type MobileTab = "slots" | "browser" | "summary"

export default function Builder() {
  const { buildId } = useParams<{ buildId?: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [build, setBuild] = useState<Build | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [compatibility, setCompatibility] = useState<CompatibilityResult | null>(null)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loginPromptOpen, setLoginPromptOpen] = useState(false)
  const [buildName, setBuildName] = useState("")
  const [mobileTab, setMobileTab] = useState<MobileTab>("slots")

  useEffect(() => {
    if (build) setBuildName(build.name)
  }, [build?.id])

  useEffect(() => {
    CategoriesApi.list().then(setCategories)

    if (user && buildId) {
      BuildsApi.get(Number(buildId))
        .then((b) => {
          setBuild(b)
          if (b.components && b.components.length > 0) {
            return BuildsApi.checkCompatibility(Number(buildId)).then(setCompatibility)
          }
        })
        .catch(() => navigate("/"))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [buildId, user])

  const componentBySlug = (build?.components ?? []).reduce<Record<string, Component>>(
    (acc, c) => {
      if (c.category?.slug) acc[c.category.slug] = c
      return acc
    },
    {}
  )

  const selectedCategory = categories.find((c) => c.slug === selectedSlug) ?? null

  const handleAddAttempt = async (component: Component) => {
    if (!user) {
      setLoginPromptOpen(true)
      return
    }

    if (!build) {
      const date = new Date().toLocaleDateString("it-IT")
      const newBuild = await BuildsApi.create(`Nuova Build ${date}`)
      const res = await BuildsApi.addComponent(newBuild.id, component.id)
      setBuild(res.build)
      setCompatibility(res.compatibility)
      navigate(`/builder/${res.build.id}`, { replace: true })
      return
    }

    const res = await BuildsApi.addComponent(build.id, component.id)
    setBuild(res.build)
    setCompatibility(res.compatibility)
  }

  const handleRemove = async (componentId: number) => {
    if (!build) return
    const updated = await BuildsApi.removeComponent(build.id, componentId)
    setBuild(updated)
    if (updated.components && updated.components.length > 0) {
      const result = await BuildsApi.checkCompatibility(build.id)
      setCompatibility(result)
    } else {
      setCompatibility(null)
    }
  }

  const handleSave = async () => {
    if (!build || !user) return
    setSaving(true)
    try {
      const updated = await BuildsApi.update(build.id, {
        name: buildName || build.name,
      })
      setBuild(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  // rinomina al blur
  const handleRename = async () => {
    if (!build || !user) return
    const trimmed = buildName.trim()
    if (!trimmed || trimmed === build.name) return
    try {
      const updated = await BuildsApi.update(build.id, { name: trimmed })
      setBuild(updated)
    } catch {
      setBuildName(build.name) // ripristina in caso di errore
    }
  }

  const handleSlotClick = (slug: string) => {
    setSelectedSlug(slug)
    setMobileTab("browser")
  }

  const psu = componentBySlug["psu"] ?? null

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground text-sm">Caricamento...</p>
        </div>
      ) : (
        <>
          <div className="flex flex-1 overflow-hidden">

            {/* colonna sinistra */}
            <aside className={cn(
              "flex-shrink-0 border-r border-border flex flex-col",
              "w-full md:w-64",
              mobileTab !== "slots" && "hidden md:flex",
            )}>
              <div className="px-4 py-4 border-b border-border">
                {build && user ? (
                  <input
                    value={buildName}
                    onChange={(e) => setBuildName(e.target.value)}
                    onBlur={handleRename}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur()
                      if (e.key === "Escape") { setBuildName(build.name); e.currentTarget.blur() }
                    }}
                    className="w-full text-sm font-semibold bg-transparent border border-transparent rounded px-1 -mx-1 focus:border-border focus:outline-none focus:bg-muted/20 transition-colors truncate"
                    maxLength={255}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground/40 italic px-1">Nessuna build attiva</p>
                )}
              </div>

              <div className="flex-1 overflow-y-auto px-3 py-3">
                {categories.length === 0
                  ? Array.from({ length: 9 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 px-3 py-3">
                        <div className="w-4 h-4 rounded bg-muted/40 animate-pulse flex-shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="h-2.5 w-16 bg-muted/40 rounded animate-pulse" />
                          <div className="h-3 w-28 bg-muted/30 rounded animate-pulse" />
                        </div>
                      </div>
                    ))
                  : categories.map((category) => (
                      <CategorySlot
                        key={category.id}
                        category={category}
                        component={componentBySlug[category.slug] ?? null}
                        isSelected={selectedSlug === category.slug}
                        compatibility={compatibility}
                        onClick={() => handleSlotClick(category.slug)}
                        onRemove={() => {
                          const c = componentBySlug[category.slug]
                          if (c) handleRemove(c.id)
                        }}
                      />
                    ))
                }
              </div>

            </aside>

            {/* centro */}
            <main className={cn(
              "flex-1 overflow-hidden flex flex-col border-r border-border",
              mobileTab !== "browser" && "hidden md:flex",
            )}>
              {selectedCategory ? (
                <ComponentBrowser
                  category={selectedCategory}
                  compatibility={compatibility}
                  buildId={build?.id}
                  onSelect={handleAddAttempt}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center px-10">
                  <div className="w-14 h-14 rounded-2xl bg-muted/40 border border-border flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-muted-foreground/30" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Scegli un componente</p>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed max-w-[220px]">
                      {user
                        ? "Seleziona una categoria dalla lista per sfogliare i componenti disponibili"
                        : "Sfoglia il catalogo liberamente — accedi per salvare la tua configurazione"}
                    </p>
                  </div>
                  {!user && (
                    <Button size="sm" variant="outline" onClick={() => setLoginPromptOpen(true)}>
                      <LogIn className="w-3.5 h-3.5" />
                      Accedi per salvare
                    </Button>
                  )}
                </div>
              )}
            </main>

            {/* colonna destra */}
            <aside className={cn(
              "flex-shrink-0 overflow-y-auto flex flex-col",
              "w-full md:w-64",
              mobileTab !== "summary" && "hidden md:flex",
            )}>
              <div className="px-5 py-6 space-y-6">
                <WattageMeter build={build ?? { total_wattage: 0, total_price: 0 } as Build} psu={psu} />

                <div className="border-t border-border pt-6">
                  <BuildSummary
                    build={build ?? { total_price: 0, components: [] } as unknown as Build}
                    onSave={handleSave}
                    saving={saving}
                    saved={saved}
                    canSave={!!user && !!build}
                  />
                </div>

                <div className="border-t border-border pt-6">
                  <CompatibilityPanel result={compatibility} />
                </div>
              </div>
            </aside>

          </div>

          {/* tab bar mobile */}
          <nav className="md:hidden flex border-t border-border bg-background flex-shrink-0">
            {([
              { tab: "slots",   icon: List,      label: "Slot" },
              { tab: "browser", icon: Search,    label: "Componenti" },
              { tab: "summary", icon: BarChart2, label: "Riepilogo" },
            ] as { tab: MobileTab; icon: React.ElementType; label: string }[]).map(({ tab, icon: Icon, label }) => (
              <button
                key={tab}
                onClick={() => setMobileTab(tab)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-3 text-[11px] transition-colors",
                  mobileTab === tab ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>
        </>
      )}

      <LoginPromptModal
        open={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
      />
    </div>
  )
}
