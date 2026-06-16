"use client"

import Image from "next/image"
import { LogOut } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type { OrganizationSettings } from "@/lib/types/organization"
import { AdminNavContent } from "./AdminNavContent"

interface AdminMobileDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orgSettings: OrganizationSettings
}

export function AdminMobileDrawer({
  open,
  onOpenChange,
  orgSettings,
}: AdminMobileDrawerProps) {
  const initial = orgSettings.name.trim().charAt(0).toUpperCase() || "L"
  const handleItemClick = () => onOpenChange(false)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        id="admin-mobile-drawer"
        side="left"
        showCloseButton
        className="w-[85%] gap-0 bg-surface p-0 sm:max-w-sm"
      >
        <SheetHeader className="flex-row items-center gap-3 space-y-0 border-b border-outline-variant/40 px-6 py-5">
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
            <SheetTitle className="truncate font-bold text-on-surface">
              {orgSettings.name}
            </SheetTitle>
            <SheetDescription>Panel Admin</SheetDescription>
          </div>
        </SheetHeader>

        <nav
          aria-label="Navegación principal"
          className="flex-1 overflow-y-auto px-3 py-4"
        >
          <AdminNavContent onItemClick={handleItemClick} />
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
      </SheetContent>
    </Sheet>
  )
}
