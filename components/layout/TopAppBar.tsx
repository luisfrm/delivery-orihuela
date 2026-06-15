"use client"

import { useState } from "react"
import { ShoppingCart, User, LogIn } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { RegistrationModal } from "@/components/modal/RegistrationModal"
import { LoginModal } from "@/components/modal/LoginModal"
import { ProfileModal } from "@/components/modal/ProfileModal"
import { useAuth } from "@/hooks/useAuth"
import { DesktopNav } from "@/components/layout/DesktopNav"
import type { OrganizationSettings } from "@/lib/types/organization"
import { DEFAULT_ORGANIZATION_SETTINGS } from "@/lib/types/organization"

interface TopAppBarProps {
  onCartClick?: () => void
  orgSettings?: OrganizationSettings
}

export function TopAppBar({ onCartClick, orgSettings }: TopAppBarProps) {
  const settings = orgSettings ?? DEFAULT_ORGANIZATION_SETTINGS
  const { isAuthenticated, isLoading } = useAuth()
  const [loginOpen, setLoginOpen] = useState(false)
  const [registerOpen, setRegisterOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <header className="fixed top-0 w-full z-50 shadow-md flex justify-between items-center h-[72px] px-[20px] bg-primary">
      <div className="flex items-center gap-[12px]">
        <div className="w-12 h-12 rounded-full bg-white overflow-hidden border-2 border-secondary-container relative">
          <Image
            src={settings.logoUrl}
            alt={settings.logoAlt}
            fill
            sizes="48px"
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-white font-bold text-lg uppercase tracking-tight">
            {settings.name}
          </span>
          <span className="text-secondary-container text-xs uppercase tracking-[0.2em] font-extrabold">
            {settings.tagline}
          </span>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 justify-start px-8">
        <DesktopNav />
      </div>

      <div className="flex items-center gap-[8px]">
        <Button
          variant="secondary"
          size="icon-xl"
          onClick={onCartClick}
          aria-label="Carrito"
        >
          <ShoppingCart className="w-5 h-5 fill-black font-bold" />
        </Button>

        {isLoading ? (
          <div className="w-12 h-12 rounded-full bg-white/20 animate-pulse hidden lg:block" />
        ) : isAuthenticated ? (
          <div className="hidden lg:block">
            <ProfileModal
              open={profileOpen}
              onOpenChange={setProfileOpen}
              trigger={
                <Button
                  variant="toolbar"
                  size="icon-xl"
                  aria-label="Perfil"
                >
                  <User className="w-6 h-6" />
                </Button>
              }
            />
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-[8px]">
            <LoginModal
              open={loginOpen}
              onOpenChange={setLoginOpen}
              onRegisterClick={() => {
                setLoginOpen(false)
                setRegisterOpen(true)
              }}
              trigger={
                <Button variant="tertiary" size="lg">
                  <LogIn className="w-4 h-4" />
                  Iniciar sesión
                </Button>
              }
            />
            <RegistrationModal
              open={registerOpen}
              onOpenChange={setRegisterOpen}
              onLoginClick={() => {
                setRegisterOpen(false)
                setLoginOpen(true)
              }}
              trigger={
                <Button variant="outline" size="lg">
                  Registrarse
                </Button>
              }
            />
          </div>
        )}
      </div>
    </header>
  )
}
