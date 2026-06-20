import env from "@/lib/env"

export async function myFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = localStorage.getItem("token")

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers ?? {}),
  }

  const res = await fetch(`${env.apiUrl}${path}`, { ...init, headers })

  // token scaduto
  if (res.status === 401) {
    localStorage.removeItem("token")
    window.location.href = "/login"
    throw new Error("Non autenticato.")
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message ?? `Errore ${res.status}`)
  }

  if (res.status === 204) return null as T

  return res.json() as Promise<T>
}
