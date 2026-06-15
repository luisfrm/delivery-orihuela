export interface RestaurantCategory {
  id: string
  name: string
}

export const RESTAURANT_CATEGORIES: readonly RestaurantCategory[] = [
  { id: "mexican", name: "Comida Mexicana" },
  { id: "asian-fusion", name: "Fusión Asiática" },
  { id: "italian", name: "Comida Italiana" },
  { id: "burgers", name: "Hamburguesas" },
  { id: "chinese", name: "Comida China" },
  { id: "sushi", name: "Sushi" },
  { id: "pizza", name: "Pizza" },
  { id: "vegetarian", name: "Vegetariana" },
  { id: "vegan", name: "Vegana" },
  { id: "seafood", name: "Mariscos" },
  { id: "desserts", name: "Postres" },
  { id: "cafe", name: "Café" },
  { id: "fast-food", name: "Comida Rápida" },
  { id: "international", name: "Internacional" },
] as const

const VALID_IDS = new Set(RESTAURANT_CATEGORIES.map((c) => c.id))

export function parseCategoryIds(value: string | null | undefined): string[] {
  if (!value) return []
  return value
    .split(";")
    .map((id) => id.trim())
    .filter((id) => id.length > 0 && VALID_IDS.has(id))
}

export function serializeCategoryIds(ids: readonly string[]): string {
  return ids
    .map((id) => id.trim())
    .filter((id) => VALID_IDS.has(id))
    .join(";")
}

export function getCategoryNames(ids: readonly string[]): string[] {
  return ids
    .map((id) => RESTAURANT_CATEGORIES.find((c) => c.id === id)?.name)
    .filter((name): name is string => Boolean(name))
}
