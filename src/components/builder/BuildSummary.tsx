import { useState } from "react"
import { useNavigate } from "react-router"
import type { Build } from "@/types"
import { Button } from "@/components/ui/button"
import { QuotesApi } from "@/api/quotes"
import { Save, FileText, Eye, CheckCircle2 } from "lucide-react"

type Props = {
  build: Build
  onSave: () => void
  saving: boolean
  saved: boolean
  canSave: boolean
}

export default function BuildSummary({ build, onSave, saving, saved, canSave }: Props) {
  const navigate = useNavigate()
  const [downloading, setDownloading] = useState(false)

  const componentCount = build.components?.length ?? 0

  const handlePdf = async () => {
    if (!build.id) return
    setDownloading(true)
    try {
      await QuotesApi.downloadPdf(build.id, build.name)
    } catch (err) {
      console.error("Errore generazione PDF:", err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Prezzo totale */}
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xs text-muted-foreground">Totale</span>
          {componentCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {componentCount} {componentCount === 1 ? "componente" : "componenti"}
            </span>
          )}
        </div>
        <p className="text-4xl font-bold leading-none text-primary tabular-nums">
          €{Number(build.total_price).toFixed(2)}
        </p>
      </div>

      {/* Azioni */}
      <div className="space-y-2">
        <Button className="w-full" onClick={onSave} disabled={saving || !canSave}>
          {saved ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              Salvato!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {saving ? "Salvataggio..." : "Salva Build"}
            </>
          )}
        </Button>

        <Button
          variant="outline"
          className="w-full text-xs h-8"
          onClick={handlePdf}
          disabled={!canSave || downloading || componentCount === 0}
        >
          <FileText className="w-3.5 h-3.5" />
          {downloading ? "Generazione..." : "Esporta PDF"}
        </Button>

        {canSave && (
          <Button
            variant="ghost"
            className="w-full text-xs h-8"
            onClick={() => navigate(`/builds/${build.id}`)}
          >
            <Eye className="w-3.5 h-3.5" />
            Visualizza dettaglio
          </Button>
        )}
      </div>
    </div>
  )
}
