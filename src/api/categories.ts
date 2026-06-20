import { myFetch } from "@/lib/backend"
import type { Category } from "@/types"

export const CategoriesApi = {
  list: () => myFetch<Category[]>("/categories"),
}
