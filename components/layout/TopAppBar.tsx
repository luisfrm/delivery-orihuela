"use client"

import { ShoppingCart, User } from "lucide-react"
import Image from "next/image"
import logo from "@/assets/logo.webp"
import { Button } from "@/components/ui/button"

interface TopAppBarProps {
  onCartClick?: () => void
  onProfileClick?: () => void
}

export function TopAppBar({ onCartClick, onProfileClick }: TopAppBarProps) {
  return (
    <header className="fixed top-0 w-full z-50 shadow-md flex justify-between items-center h-[72px] px-[20px] bg-primary">
      <div className="flex items-center gap-[12px]">
        <div className="w-12 h-12 rounded-full bg-white overflow-hidden border-2 border-secondary-container relative">
          <Image src={logo} alt="Los Latinos Logo" fill sizes="48px" className="object-cover" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-white font-bold text-lg uppercase tracking-tight">Los Latinos</span>
          <span className="text-secondary-container text-xs uppercase tracking-[0.2em] font-extrabold">MotoTaxi</span>
        </div>
      </div>
      <div className="flex items-center gap-[8px]">
        <Button
          variant="secondary"
          size="icon-xl"
          onClick={onCartClick}
          aria-label="Carrito"
        >
          <ShoppingCart className="w-5 h-5" />
        </Button>
        <Button
          variant="toolbar"
          size="icon-xl"
          onClick={onProfileClick}
          aria-label="Perfil"
        >
          <User className="w-6 h-6" />
        </Button>
      </div>
    </header>
  )
}