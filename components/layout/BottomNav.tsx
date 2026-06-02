"use client"

import { useAuth } from "@/hooks/useAuth"
import { AuthenticatedNav } from "@/components/layout/AuthenticatedNav"
import { GuestNav } from "@/components/layout/GuestNav"

interface BottomNavProps {
  activeHref?: string
}

export function BottomNav({ activeHref = "/" }: BottomNavProps) {
  const { isAuthenticated, isLoading } = useAuth()

  return (
    <nav className="lg:hidden fixed bottom-0 w-full z-40 bg-surface-container-lowest border-t border-outline-variant">
      {isLoading ? (
        <div className="flex justify-center items-center h-[80px]">
          <div className="w-8 h-8 rounded-full bg-outline/20 animate-pulse" />
        </div>
      ) : isAuthenticated ? (
        <AuthenticatedNav activeHref={activeHref} />
      ) : (
        <GuestNav />
      )}
    </nav>
  )
}