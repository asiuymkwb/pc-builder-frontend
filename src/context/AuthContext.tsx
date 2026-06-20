import { createContext, useContext, useEffect, useState } from "react"
import { AuthApi } from "@/api/auth"
import type { User } from "@/types"

type AuthState = {
  user: User | null
  token: string | null
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  adminLogin: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string, confirmation: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthState | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"))

  // ripristina sessione al refresh
  useEffect(() => {
    if (token && !user) {
      AuthApi.me()
        .then(setUser)
        .catch(() => {
          localStorage.removeItem("token")
          setToken(null)
        })
    }
  }, [])

  const saveSession = (data: { user: User; token: string }) => {
    localStorage.setItem("token", data.token)
    setToken(data.token)
    setUser(data.user)
  }

  const login = async (email: string, password: string) => {
    const data = await AuthApi.login(email, password)
    saveSession(data)
  }

  const adminLogin = async (email: string, password: string) => {
    const data = await AuthApi.adminLogin(email, password)
    saveSession(data)
  }

  const register = async (name: string, email: string, password: string, confirmation: string) => {
    const data = await AuthApi.register(name, email, password, confirmation)
    saveSession(data)
  }

  const logout = async () => {
    await AuthApi.logout().catch(() => {})
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin: user?.role === "admin",
        login,
        adminLogin,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth deve essere usato dentro AuthProvider")
  return ctx
}
