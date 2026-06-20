import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { BuildsApi } from "@/api/builds"
import type { Build } from "@/types"
import Navbar from "@/components/layout/Navbar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Cpu, Trash2, Pencil, Eye } from "lucide-react"

export default function Builds() {
  const navigate = useNavigate()
  const [builds, setBuilds] = useState<Build[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)

  useEffect(() => {
    BuildsApi.list().then(setBuilds).finally(() => setLoading(false))
  }, [])

  const handleNewBuild = async () => {
    setCreating(true)
    try {
      const date = new Date().toLocaleDateString("it-IT")
      const build = await BuildsApi.create(`Nuova Build ${date}`)
      navigate(`/builder/${build.id}`)
    } catch {
      setCreating(false)
    }
  }

  const handleDelete = async () => {
    if (deleteId === null) return
    await BuildsApi.delete(deleteId)
    setBuilds((prev) => prev.filter((b) => b.id !== deleteId))
    setDeleteId(null)
  }

  const buildToDelete = builds.find((b) => b.id === deleteId)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="max-w-6xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold">Le mie build</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {builds.length > 0
                ? `${builds.length} ${builds.length === 1 ? "configurazione salvata" : "configurazioni salvate"}`
                : "Nessuna build ancora"}
            </p>
          </div>
          <Button onClick={handleNewBuild} disabled={creating}>
            <Plus className="w-4 h-4" />
            {creating ? "Creazione..." : "Nuova Build"}
          </Button>
        </div>

        {loading && (
          <p className="text-muted-foreground text-sm">Caricamento...</p>
        )}

        {!loading && builds.length === 0 && (
          <div className="text-center py-24 flex flex-col items-center gap-4">
            <Cpu className="w-8 h-8 text-muted-foreground/20" />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nessuna build salvata</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Clicca "Nuova Build" per iniziare ad assemblare il tuo PC
              </p>
            </div>
            <Button size="sm" onClick={handleNewBuild} disabled={creating}>
              <Plus className="w-4 h-4" />
              Crea la tua prima build
            </Button>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {builds.map((build) => (
            <BuildCard
              key={build.id}
              build={build}
              onEdit={() => navigate(`/builder/${build.id}`)}
              onView={() => navigate(`/builds/${build.id}`)}
              onDelete={() => setDeleteId(build.id)}
            />
          ))}
        </div>
      </main>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare la build?</AlertDialogTitle>
            <AlertDialogDescription>
              "{buildToDelete?.name}" verrà eliminata definitivamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Elimina</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function BuildCard({
  build,
  onEdit,
  onView,
  onDelete,
}: {
  build: Build
  onEdit: () => void
  onView: () => void
  onDelete: () => void
}) {
  const componentCount = build.components_count ?? build.components?.length ?? 0

  return (
    <div className="group flex flex-col border border-border rounded-xl bg-card hover:border-primary/30 hover:shadow-md transition-all overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-sm leading-tight truncate">{build.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {new Date(build.created_at).toLocaleDateString("it-IT", {
              day: "numeric", month: "short", year: "numeric"
            })}
          </p>
        </div>
        <Badge variant={build.is_complete ? "default" : "secondary"} className="flex-shrink-0 text-[11px]">
          {build.is_complete ? "Completa" : "In corso"}
        </Badge>
      </div>

      {/* Stats */}
      <div className="px-4 pb-4 border-b border-border/50">
        <p className="text-sm font-semibold tabular-nums">
          €{Number(build.total_price).toFixed(2)}
          <span className="text-muted-foreground font-normal ml-2">{build.total_wattage}W</span>
          {componentCount > 0 && (
            <span className="text-muted-foreground font-normal ml-2">· {componentCount} comp.</span>
          )}
        </p>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 flex gap-2">
        <Button variant="outline" className="flex-1 h-8 text-xs" size="sm" onClick={onView}>
          <Eye className="w-3 h-3" />
          Visualizza
        </Button>
        <Button className="flex-1 h-8 text-xs" size="sm" onClick={onEdit}>
          <Pencil className="w-3 h-3" />
          Modifica
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          className="hover:text-destructive hover:border-destructive/30 hover:bg-destructive/5"
          onClick={onDelete}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  )
}
