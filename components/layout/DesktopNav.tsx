"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { navItems } from "@/lib/config/navigation"
import { cn } from "@/lib/utils"

export function DesktopNav() {
  const pathname = usePathname()
  const { role, isAuthenticated } = useAuth()

  if (!isAuthenticated) return null

  const filteredItems = navItems.filter((item) => {
    if (item.mobileOnly) return false
    if (item.requireRole) {
      return role === "admin" || role === "rider"
    }
    return true
  })

  return (
    <nav className="flex items-center gap-8">
      {filteredItems.map((item) => {
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative group flex items-center py-2 text-white/90 hover:text-white transition-colors"
          >
            <span className="font-semibold text-body-md tracking-wide">
              {item.label}
            </span>
            {/* Animated Underline */}
            <span
              className={cn(
                "absolute left-0 -bottom-1 h-[3px] w-full bg-secondary rounded-full origin-left transition-all duration-300",
                isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0 group-hover:opacity-60 group-hover:scale-x-100"
              )}
            />
          </Link>
        )
      })}
    </nav>
  )
}
