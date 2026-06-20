import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Cpu } from "lucide-react"

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-6 text-center px-4">
      <div className="flex items-center gap-2.5 mb-2">
        <Cpu className="w-5 h-5 text-primary" />
        <span className="font-semibold text-lg">PC Builder</span>
      </div>

      <div>
        <p className="text-7xl font-bold text-primary tabular-nums">404</p>
        <h1 className="text-xl font-semibold mt-3">Pagina non trovata</h1>
        <p className="text-sm text-muted-foreground mt-2">
          La pagina che stai cercando non esiste o è stata spostata.
        </p>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => navigate("/")}>
          Vai al Builder
        </Button>
        <Button variant="outline" onClick={() => window.history.back()}>
          Torna indietro
        </Button>
      </div>
    </div>
  )
}
