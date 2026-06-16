import Image from "next/image"
import { LogOut } from "lucide-react"

import { cn } from "@/lib/utils"
import type { OrganizationSettings } from "@/lib/types/organization"
import { AdminNavContent } from "./AdminNavContent"

interface AdminDesktopSidebarProps {
  orgSettings: OrganizationSettings
}

export function AdminDesktopSidebar({ orgSettings }: AdminDesktopSidebarProps) {
  const initial = orgSettings.name.trim().charAt(0).toUpperCase() || "L"

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-outline-variant/60 bg-surface shadow-[inset_-1px_0_0_rgba(0,0,0,0.02)] lg:flex"
      aria-label="Navegación del panel"
    >
      <div className="flex h-20 items-center gap-3 border-b border-outline-variant/40 px-6 py-5">
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary font-bold text-white">
          {orgSettings.logoUrl ? (
            <Image
              src={orgSettings.logoUrl}
              alt={orgSettings.logoAlt}
              width={40}
              height={40}
              className="size-full object-cover"
              unoptimized
            />
          ) : (
            <span>{initial}</span>
          )}
        </div>
        <div className="min-w-0">
          <span className="block truncate font-bold text-on-surface">
            {orgSettings.name}
          </span>
          <span className="block text-xs text-on-surface-variant">
            Panel Admin
          </span>
        </div>
      </div>

      <nav
        aria-label="Navegación principal"
        className="flex-1 overflow-y-auto px-3 py-5"
      >
        <AdminNavContent />
      </nav>

      <div className="border-t border-outline-variant/40 p-3">
        <button
          type="button"
          className={cn(
            "group/logout flex w-full items-center gap-3 rounded-lg px-4 py-3 text-body-md font-semibold tracking-tight text-error transition-colors duration-200",
            "hover:bg-error-container/30 focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 focus-visible:outline-none"
          )}
        >
          <LogOut className="size-5 transition-transform duration-200 group-hover/logout:scale-110" />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}
