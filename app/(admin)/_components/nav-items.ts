import type { LucideIcon } from "lucide-react"
import {
  Home,
  LayoutDashboard,
  ShoppingCart,
  Settings as SettingsIcon,
  UtensilsCrossed,
  Users,
} from "lucide-react"

export type NavSection = "principal" | "sistema"

export interface AdminNavItem {
  href: string
  label: string
  icon: LucideIcon
  /**
   * Tailwind classes applied to the icon in its default (non-active) state.
   * Lets each item carry a different brand color tint.
   */
  iconClass?: string
  /**
   * When true, a subtle horizontal divider is rendered after this item to
   * visually separate it from the following items.
   */
  dividerAfter?: boolean
  /**
   * Optional section grouping. Section labels are rendered above the first
   * item of each section.
   */
  section?: NavSection
}

export const navSectionLabels: Record<NavSection, string> = {
  principal: "Principal",
  sistema: "Sistema",
}

export const adminNavItems: AdminNavItem[] = [
  {
    href: "/",
    icon: Home,
    label: "Volver al inicio",
    iconClass: "text-on-surface-variant",
    dividerAfter: true,
  },
  {
    href: "/panel",
    icon: LayoutDashboard,
    label: "Dashboard",
    iconClass: "text-primary",
    section: "principal",
  },
  {
    href: "/panel/users",
    icon: Users,
    label: "Usuarios",
    iconClass: "text-tertiary",
    section: "principal",
  },
  {
    href: "/panel/orders",
    icon: ShoppingCart,
    label: "Pedidos",
    iconClass: "text-secondary",
    section: "principal",
  },
  {
    href: "/panel/restaurants",
    icon: UtensilsCrossed,
    label: "Restaurantes",
    iconClass: "text-primary",
    section: "principal",
  },
  {
    href: "/panel/settings",
    icon: SettingsIcon,
    label: "Configuración",
    iconClass: "text-on-surface-variant",
    section: "sistema",
  },
]
