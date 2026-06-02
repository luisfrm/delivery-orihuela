"use client"

import { ShoppingCart, User } from "lucide-react"

interface TopAppBarProps {
  onCartClick?: () => void
  onProfileClick?: () => void
}

export function TopAppBar({ onCartClick, onProfileClick }: TopAppBarProps) {
  return (
    <header className="fixed top-0 w-full z-50 shadow-md flex justify-between items-center h-[72px] px-[20px] bg-primary">
      <div className="flex items-center gap-[12px]">
        <div className="w-12 h-12 rounded-full bg-white overflow-hidden border-2 border-secondary-container">
          <div className="w-full h-full bg-secondary-container flex items-center justify-center text-primary font-bold text-lg">
            LL
          </div>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-white font-bold text-lg uppercase tracking-tight">Los Latinos</span>
          <span className="text-secondary-container text-xs uppercase tracking-[0.2em] font-extrabold">MotoTaxi</span>
        </div>
      </div>
      <div className="flex items-center gap-[8px]">
        <button
          onClick={onCartClick}
          className="bg-secondary-container text-on-secondary w-12 h-12 rounded-full flex items-center justify-center gap-[8px] font-bold shadow-sm active:scale-95 transition-transform"
        >
          <ShoppingCart className="w-5 h-5" />
        </button>
        <button
          onClick={onProfileClick}
          className="bg-white text-primary w-12 h-12 rounded-full flex items-center justify-center shadow-sm active:scale-95 transition-transform"
        >
          <User className="w-6 h-6" />
        </button>
      </div>
    </header>
  )
}