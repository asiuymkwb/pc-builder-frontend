import { useState } from "react"
import { useNavigate, Link } from "react-router"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Cpu } from "lucide-react"

export default function AdminLogin() {
  const { adminLogin } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await adminLogin(email, password)
      navigate("/admin")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Accesso non autorizzato.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 font-bold text-base mb-10">
          <Cpu className="w-4 h-4 text-primary" />
          PC Builder
        </Link>

        <h1 className="text-2xl font-bold">Pannello Admin</h1>
        <p className="text-sm text-muted-foreground mt-1 mb-8">
          Accesso riservato agli amministratori del sistema.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@pcbuilder.it"
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
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 px-3 py-2.5 rounded-md">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Verifica in corso..." : "Accedi"}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-border">
          <Link
            to="/login"
            className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            ← Torna al login utente
          </Link>
        </div>
      </div>
    </div>
  )
}
