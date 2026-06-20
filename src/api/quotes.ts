import { myFetch } from "@/lib/backend"
import env from "@/lib/env"
import type { Quote } from "@/types"

export const QuotesApi = {
  // Genera il PDF server-side e lo scarica nel browser
  downloadPdf: async (buildId: number, buildName: string) => {
    const token = localStorage.getItem("token")

    const res = await fetch(`${env.apiUrl}/builds/${buildId}/quote`, {
      method: "POST",
      headers: {
        Accept: "application/pdf",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? `Errore ${res.status}`)
    }

    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `preventivo-${buildName.replace(/\s+/g, "-")}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },

  list: () => myFetch<Quote[]>("/quotes"),
}
