import type { LucideIcon } from "lucide-react"
import {
  LayoutDashboard,
  ShoppingCart,
  Settings as SettingsIcon,
  UtensilsCrossed,
  Users,
} from "lucide-react"

export interface AdminNavItem {
  href: string
  label: string
  icon: LucideIcon
}

export const adminNavItems: AdminNavItem[] = [
  { href: "/panel", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/panel/users", icon: Users, label: "Usuarios" },
  { href: "/panel/orders", icon: ShoppingCart, label: "Pedidos" },
  { href: "/panel/restaurants", icon: UtensilsCrossed, label: "Restaurantes" },
  { href: "/panel/settings", icon: SettingsIcon, label: "Configuración" },
]
