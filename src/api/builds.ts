import { myFetch } from "@/lib/backend"
import type { Build, CompatibilityResult } from "@/types"

type AddComponentResponse = { build: Build; compatibility: CompatibilityResult }

export const BuildsApi = {
  list: () => myFetch<Build[]>("/builds"),

  create: (name: string) =>
    myFetch<Build>("/builds", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  get: (id: number) => myFetch<Build>(`/builds/${id}`),

  update: (id: number, data: { name?: string }) =>
    myFetch<Build>(`/builds/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    myFetch<{ message: string }>(`/builds/${id}`, { method: "DELETE" }),

  addComponent: (buildId: number, componentId: number, quantity = 1) =>
    myFetch<AddComponentResponse>(`/builds/${buildId}/components`, {
      method: "POST",
      body: JSON.stringify({ component_id: componentId, quantity }),
    }),

  removeComponent: (buildId: number, componentId: number) =>
    myFetch<Build>(`/builds/${buildId}/components/${componentId}`, {
      method: "DELETE",
    }),

  checkCompatibility: (buildId: number) =>
    myFetch<CompatibilityResult>(`/builds/${buildId}/compatibility`),
}
