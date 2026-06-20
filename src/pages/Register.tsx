import { useState } from "react"
import { useNavigate, Link } from "react-router"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Cpu } from "lucide-react"

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName]                 = useState("")
  const [email, setEmail]               = useState("")
  const [password, setPassword]         = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [error, setError]               = useState<string | null>(null)
  const [loading, setLoading]           = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmation) {
      setError("Le password non coincidono.")
      return
    }
    if (password.length < 8) {
      setError("La password deve essere di almeno 8 caratteri.")
      return
    }

    setLoading(true)
    try {
      await register(name, email, password, confirmation)
      navigate("/")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore durante la registrazione.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">

        <Link to="/" className="flex items-center gap-2 font-bold text-base mb-8">
          <Cpu className="w-4 h-4 text-primary" />
          PC Builder
        </Link>

          <h1 className="text-2xl font-bold">Crea il tuo account</h1>
          <p className="text-sm text-muted-foreground mt-1 mb-8">
            Registrati gratis e inizia a configurare il tuo PC.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mario Rossi"
                required
                autoComplete="name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@esempio.com"
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimo 8 caratteri"
                required
                autoComplete="new-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmation">Conferma password</Label>
              <Input
                id="confirmation"
                type="password"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
                placeholder="Ripeti la password"
                required
                autoComplete="new-password"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2.5 rounded-md">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? "Registrazione..." : "Crea account"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground mt-6">
            Hai già un account?{" "}
            <Link to="/login" className="text-foreground font-medium hover:underline">
              Accedi
            </Link>
          </p>
        </div>
    </div>
  )
}
