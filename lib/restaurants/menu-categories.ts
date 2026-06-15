import {
  Cake,
  Drumstick,
  GlassWater,
  Salad,
  Soup,
  Wheat,
  type LucideIcon,
} from "lucide-react"

export interface MenuCategory {
  id: string
  name: string
  icon: LucideIcon
}

export const MENU_CATEGORIES: readonly MenuCategory[] = [
  { id: "entradas", name: "Entradas", icon: Salad },
  { id: "platos-fuertes", name: "Platos fuertes", icon: Drumstick },
  { id: "bebidas", name: "Bebidas", icon: GlassWater },
  { id: "postres", name: "Postres", icon: Cake },
  { id: "acompanamientos", name: "Acompañamientos", icon: Wheat },
  { id: "ensaladas", name: "Ensaladas", icon: Soup },
] as const

export function getCategoryById(id: string): MenuCategory | undefined {
  return MENU_CATEGORIES.find((c) => c.id === id)
}

export function getDefaultCategoryOrder(): string[] {
  return MENU_CATEGORIES.map((c) => c.id)
}

export function parseCategoryOrder(value: string | null | undefined): string[] {
  if (!value) return getDefaultCategoryOrder()
  const ids = value
    .split(";")
    .map((id) => id.trim())
    .filter((id) => id.length > 0)
  const validIds = new Set(MENU_CATEGORIES.map((c) => c.id))
  const filtered = ids.filter((id) => validIds.has(id))
  const missing = MENU_CATEGORIES.map((c) => c.id).filter((id) => !filtered.includes(id))
  return [...filtered, ...missing]
}

export function serializeCategoryOrder(ids: readonly string[]): string {
  const validIds = new Set(MENU_CATEGORIES.map((c) => c.id))
  return ids.filter((id) => validIds.has(id)).join(";")
}
