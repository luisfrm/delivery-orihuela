import { Home, Bell, User, LayoutDashboard } from "lucide-react"

export interface NavItem {
  icon: React.ReactNode
  label: string
  href: string
  isModal?: boolean
  requireRole?: boolean
  mobileOnly?: boolean
}

export const navItems: NavItem[] = [
  { icon: <Home className="w-6 h-6" />, label: "Inicio", href: "/" },
  { icon: <Bell className="w-6 h-6" />, label: "Pedidos", href: "/orders" },
  { icon: <LayoutDashboard className="w-6 h-6" />, label: "Panel", href: "/panel", requireRole: true },
  { icon: <User className="w-6 h-6" />, label: "Perfil", href: "/profile", isModal: true, mobileOnly: true },
]
