import type { CompatibilityResult } from "@/types"
import { Check, X, AlertTriangle, AlertCircle } from "lucide-react"

type Props = {
  result: CompatibilityResult | null
}

const RULE_LABELS: Record<string, string> = {
  R1: "Socket CPU / Scheda madre",
  R2: "Generazione RAM / Scheda madre",
  R3: "Alimentazione PSU sufficiente",
  R4: "Form factor case / Scheda madre",
  R5: "Lunghezza GPU / Case",
  R6: "Dissipatore compatibile CPU",
  R7: "Altezza dissipatore / Case",
  W1: "Velocità RAM vs limite CPU",
  W2: "TDP dissipatore vs CPU",
}

export default function CompatibilityPanel({ result }: Props) {
  if (!result) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Compatibilità</p>
        <p className="text-xs text-muted-foreground/60 leading-relaxed">
          Aggiungi due o più componenti correlati per avviare la verifica.
        </p>
      </div>
    )
  }

  const { errors, warnings, is_compatible } = result

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Compatibilità</p>

      {/* Status banner */}
      {is_compatible ? (
        <div className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-green-500/10 border border-green-500/20">
          <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
          <span className="text-xs text-green-500 font-medium">
            {warnings.length > 0 ? `${warnings.length} avviso` : "Tutto compatibile"}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-2.5 py-2 rounded-md bg-destructive/10 border border-destructive/20">
          <AlertCircle className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
          <span className="text-xs text-destructive font-medium">
            {errors.length} {errors.length === 1 ? "problema" : "problemi"} rilevati
          </span>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((e) => (
            <div key={e.rule} className="flex items-start gap-2 px-2 py-1.5 rounded-md bg-destructive/5 border border-destructive/10">
              <X className="w-3 h-3 text-destructive mt-0.5 flex-shrink-0" />
              <span className="text-xs text-destructive/90 leading-tight">
                {RULE_LABELS[e.rule] ?? e.rule}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-1">
          {warnings.map((w) => (
            <div key={w.rule} className="flex items-start gap-2 px-2 py-1.5 rounded-md bg-yellow-500/5 border border-yellow-500/15">
              <AlertTriangle className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
              <span className="text-xs text-yellow-500/90 leading-tight">
                {RULE_LABELS[w.rule] ?? w.rule}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
