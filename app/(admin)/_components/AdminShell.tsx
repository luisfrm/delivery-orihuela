"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  UtensilsCrossed,
  LogOut,
  Settings as SettingsIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type { OrganizationSettings } from "@/lib/types/organization"

interface AdminShellProps {
  children: React.ReactNode
  orgSettings: OrganizationSettings
}

const navItems = [
  { href: "/panel", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/panel/users", icon: Users, label: "Usuarios" },
  { href: "/panel/orders", icon: ShoppingCart, label: "Pedidos" },
  { href: "/panel/restaurants", icon: UtensilsCrossed, label: "Restaurantes" },
  { href: "/panel/settings", icon: SettingsIcon, label: "Configuración" },
]

export function AdminShell({ children, orgSettings }: AdminShellProps) {
  const pathname = usePathname()

  const initial = orgSettings.name.trim().charAt(0).toUpperCase() || "L"

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-surface-container border-r border-outline-variant">
        <div className="flex h-[72px] items-center gap-3 px-6 border-b border-outline-variant">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold overflow-hidden">
            {orgSettings.logoUrl ? (
              <Image
                src={orgSettings.logoUrl}
                alt={orgSettings.logoAlt}
                width={40}
                height={40}
                className="object-cover w-full h-full"
                unoptimized
              />
            ) : (
              <span>{initial}</span>
            )}
          </div>
          <div className="min-w-0">
            <span className="block font-bold text-on-surface truncate">
              {orgSettings.name}
            </span>
            <span className="block text-xs text-on-surface-variant">Panel Admin</span>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
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
                <Icon className="w-5 h-5" />
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
