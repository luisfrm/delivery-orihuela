"use client"

import { Home, Search, Bell, User } from "lucide-react"

interface NavItem {
  icon: React.ReactNode
  label: string
  href: string
  active?: boolean
}

const navItems: NavItem[] = [
  { icon: <Home className="w-6 h-6" />, label: "Inicio", href: "/" },
  { icon: <Search className="w-6 h-6" />, label: "Explorar", href: "/explore" },
  { icon: <Bell className="w-6 h-6" />, label: "Pedidos", href: "/orders" },
  { icon: <User className="w-6 h-6" />, label: "Perfil", href: "/profile" },
]

interface BottomNavProps {
  activeHref?: string
}

export function BottomNav({ activeHref = "/" }: BottomNavProps) {
  return (
    <nav className="lg:hidden fixed bottom-0 w-full z-50 bg-surface-container-lowest border-t border-outline-variant">
      <div className="flex justify-around items-center h-[80px] px-[20px]">
        {navItems.map((item) => {
          const isActive = item.href === activeHref
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-[4px] ${isActive ? "text-primary" : "text-on-surface-variant"
                }`}
            >
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${isActive ? "bg-primary-container text-on-primary-container" : ""
                  }`}
              >
                {item.icon}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </a>
          )
        })}
      </div>
    </nav>
  )
}