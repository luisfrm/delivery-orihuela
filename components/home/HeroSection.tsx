"use client"

import { ShoppingBag, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface HeroSectionProps {
  onBuyClick?: () => void
  onPickupClick?: () => void
}

export function HeroSection({ onBuyClick, onPickupClick }: HeroSectionProps) {
  return (
    <section className="relative w-full min-h-[460px] flex flex-col items-center justify-center px-[20px] py-[32px] bg-primary plus-pattern">
      <div className="z-10 flex flex-col items-center text-center gap-[16px] w-full max-w-sm">
        <h2 className="text-display-lg uppercase tracking-tight text-center">
          <span className="text-white">PIDE TU COMIDA</span>
          <br />
          <span className="text-secondary">FAVORITA</span>
        </h2>
        <p className="text-body-lg text-white opacity-90">Entregamos rápido donde estés 🏍️</p>

        <div className="flex flex-col gap-[12px] w-full max-w-sm mt-[16px]">
          <Button
            variant="secondary"
            size="xl"
            className="w-full"
            onClick={onBuyClick}
          >
            <ShoppingBag className="w-5 h-5" />
            Comprar
          </Button>
          <Button
            variant="ghost"
            size="xl"
            className="w-full"
            onClick={onPickupClick}
          >
            <Truck className="w-5 h-5" />
            Recoger
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-[12px] mt-[24px]">
          <Badge variant="hero">
            <span>⚡</span>
            30-45 min
          </Badge>
          <Badge variant="hero">
            <span>🛵</span>
            Envío económico
          </Badge>
          <Badge variant="hero">
            <span>📞</span>
            Atención 24h
          </Badge>
        </div>
      </div>
    </section>
  )
}