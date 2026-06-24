"use client"

import Image from "next/image"
import { LogOut } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type { OrganizationSettings } from "@/lib/types/organization"
import type { UserRole } from "@/lib/types"
import { AdminNavContent } from "./AdminNavContent"

interface AdminMobileDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orgSettings: OrganizationSettings
  userRole: UserRole | null
}

const DRAWER_BG_STYLE = {
  background:
    "linear-gradient(to bottom, color-mix(in oklab, var(--color-primary) 6%, var(--color-surface)), var(--color-surface))",
} as const

export function AdminMobileDrawer({
  open,
  onOpenChange,
  orgSettings,
  userRole,
}: AdminMobileDrawerProps) {
  const initial = orgSettings.name.trim().charAt(0).toUpperCase() || "L"
  const handleItemClick = () => onOpenChange(false)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        id="admin-mobile-drawer"
        side="right"
        showCloseButton
        style={DRAWER_BG_STYLE}
        className="w-[85%] gap-0 p-0 sm:max-w-sm"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 -right-40 size-96 rounded-full bg-primary/10 blur-3xl"
        />

        <div className="relative m-4 overflow-hidden rounded-2xl border border-outline-variant/40 bg-gradient-to-br from-surface-container-low to-surface p-4 shadow-sm">
          <div
            aria-hidden
            className="absolute inset-x-0 -top-px h-1.5 bg-gradient-to-r from-primary via-primary to-secondary-container"
          />
          <div className="flex items-center gap-3 pt-1">
            <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary font-bold text-white ring-2 ring-primary/20 ring-offset-2 ring-offset-surface-container-low">
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
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <SheetTitle className="truncate font-bold text-on-surface">
                  {orgSettings.name}
                </SheetTitle>
                <span
                  aria-label="Sistema en línea"
                  className="size-2 shrink-0 rounded-full bg-green-500 animate-pulse"
                />
              </div>
              <SheetDescription>Panel Admin</SheetDescription>
            </div>
          </div>
        </div>

        <nav
          aria-label="Navegación principal"
          className="relative flex-1 overflow-y-auto px-3 py-2"
        >
          <AdminNavContent onItemClick={handleItemClick} userRole={userRole} />
        </nav>

        <div className="relative border-t border-outline-variant/40 p-3">
          <button
            type="button"
            className={cn(
              "group/logout flex w-full items-center gap-3 rounded-xl px-4 py-3 text-body-md font-semibold tracking-tight text-error transition-colors duration-200",
              "hover:bg-error-container/30 focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 focus-visible:outline-none"
            )}
          >
            <LogOut className="size-5 transition-transform duration-200 group-hover/logout:scale-110" />
            Cerrar Sesión
          </button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
