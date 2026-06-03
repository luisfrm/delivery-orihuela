"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, ShoppingCart, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/panel", icon: <LayoutDashboard className="w-5 h-5" />, label: "Dashboard" },
  { href: "/panel/users", icon: <Users className="w-5 h-5" />, label: "Usuarios" },
  { href: "/panel/orders", icon: <ShoppingCart className="w-5 h-5" />, label: "Pedidos" },
]

function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-surface-container border-r border-outline-variant">
        <div className="flex h-[72px] items-center gap-3 px-6 border-b border-outline-variant">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
            LL
          </div>
          <div>
            <span className="font-bold text-on-surface">Los Latinos</span>
            <span className="block text-xs text-on-surface-variant">Panel Admin</span>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-container text-on-primary-container"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-outline-variant">
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-error w-full hover:bg-error-container transition-colors">
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="ml-64 p-8">{children}</main>
    </div>
  )
}

export default AdminLayout