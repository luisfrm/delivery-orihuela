"use client"

import { useState } from "react"
import { Home, Search, Bell, User } from "lucide-react"
import { ProfileModal } from "@/components/modal/ProfileModal"

interface NavItem {
  icon: React.ReactNode
  label: string
  href: string
  isModal?: boolean
}

const navItems: NavItem[] = [
  { icon: <Home className="w-6 h-6" />, label: "Inicio", href: "/" },
  { icon: <Search className="w-6 h-6" />, label: "Explorar", href: "/explore" },
  { icon: <Bell className="w-6 h-6" />, label: "Pedidos", href: "/orders" },
  { icon: <User className="w-6 h-6" />, label: "Perfil", href: "/profile", isModal: true },
]

interface AuthenticatedNavProps {
  activeHref?: string
}

export function AuthenticatedNav({ activeHref = "/" }: AuthenticatedNavProps) {
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <div className="flex justify-around items-center h-[80px] px-[20px]">
      {navItems.map((item) => {
        const isActive = item.href === activeHref || (item.isModal && profileOpen)

        if (item.isModal) {
          return (
            <ProfileModal
              key={item.href}
              open={profileOpen}
              onOpenChange={setProfileOpen}
              trigger={
                <button
                  type="button"
                  className={`flex flex-col items-center gap-[4px] cursor-pointer ${
                    isActive ? "text-primary" : "text-on-surface-variant"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                      isActive
                        ? "bg-primary-container text-on-primary-container"
                        : ""
                    }`}
                  >
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              }
            />
          )
        }

        return (
          <a
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-[4px] ${
              isActive ? "text-primary" : "text-on-surface-variant"
            }`}
          >
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-colors ${
                isActive
                  ? "bg-primary-container text-on-primary-container"
                  : ""
              }`}
            >
              {item.icon}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </a>
        )
      })}
    </div>
  )
}
