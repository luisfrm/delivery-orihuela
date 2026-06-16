"use client"

import Image from "next/image"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { OrganizationSettings } from "@/lib/types/organization"

interface AdminMobileHeaderProps {
  onMenuClick: () => void
  orgSettings: OrganizationSettings
}

export function AdminMobileHeader({ onMenuClick, orgSettings }: AdminMobileHeaderProps) {
  const initial = orgSettings.name.trim().charAt(0).toUpperCase() || "L"

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between border-b border-outline-variant bg-surface-container-lowest/95 px-4 backdrop-blur-sm lg:hidden"
      role="banner"
    >
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary font-bold text-white">
          {orgSettings.logoUrl ? (
            <Image
              src={orgSettings.logoUrl}
              alt={orgSettings.logoAlt}
              width={36}
              height={36}
              className="size-full object-cover"
              unoptimized
            />
          ) : (
            <span className="text-sm">{initial}</span>
          )}
        </div>
        <span className="truncate font-bold text-on-surface">
          {orgSettings.name}
        </span>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onMenuClick}
        aria-label="Abrir menú"
        aria-controls="admin-mobile-drawer"
      >
        <Menu className="size-5" />
      </Button>
    </header>
  )
}
