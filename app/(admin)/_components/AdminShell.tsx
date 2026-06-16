"use client"

import { useState } from "react"

import type { OrganizationSettings } from "@/lib/types/organization"
import { AdminDesktopSidebar } from "./AdminDesktopSidebar"
import { AdminMobileDrawer } from "./AdminMobileDrawer"
import { AdminMobileHeader } from "./AdminMobileHeader"

interface AdminShellProps {
  children: React.ReactNode
  orgSettings: OrganizationSettings
}

export function AdminShell({ children, orgSettings }: AdminShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <AdminMobileHeader
        onMenuClick={() => setDrawerOpen(true)}
        orgSettings={orgSettings}
      />

      <AdminMobileDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        orgSettings={orgSettings}
      />

      <AdminDesktopSidebar orgSettings={orgSettings} />

      <main className="pt-20 px-4 pb-8 lg:ml-72 lg:p-8 lg:pt-8">
        {children}
      </main>
    </div>
  )
}
