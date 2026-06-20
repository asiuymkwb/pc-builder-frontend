/*
 * api/components.ts — chiamate API per il catalogo componenti.
 *
 * list() supporta filtri opzionali:
 *   - category: slug della categoria (es. "cpu", "ram")
 *   - brand: filtra per marca
 *   - max_price: prezzo massimo
 *   - compatible_with_build: ID build → il backend filtra solo i componenti
 *     compatibili con quelli già nella build (socket, DDR gen, ecc.)
 */
import { myFetch } from "@/lib/backend"
import type { Component } from "@/types"

type Filters = {
  category?: string
  brand?: string
  max_price?: number
  compatible_with_build?: number
}

export const ComponentsApi = {
  list: (filters?: Filters) => {
    const params = new URLSearchParams()
    if (filters?.category) params.set("category", filters.category)
    if (filters?.brand) params.set("brand", filters.brand)
    if (filters?.max_price) params.set("max_price", String(filters.max_price))
    if (filters?.compatible_with_build) params.set("compatible_with_build", String(filters.compatible_with_build))

    const query = params.toString() ? `?${params.toString()}` : ""
    return myFetch<Component[]>(`/components${query}`)
  },

  get: (id: number) => myFetch<Component>(`/components/${id}`),
}
