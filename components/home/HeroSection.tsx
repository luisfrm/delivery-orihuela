"use client"

import { Zap, Bike, Phone } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import heroImage from "@/assets/hero.webp"
import BuyModal from "@/components/modal/BuyModal"
import PickupModal from "@/components/modal/PickupModal"

export function HeroSection() {
  return (
    <section className="relative w-full min-h-[460px] lg:min-h-screen flex items-center overflow-hidden bg-primary plus-pattern">
      <div className="container mx-auto px-5 lg:px-8 flex flex-col lg:flex-row items-center justify-center gap-12">
        <div className="z-10 flex flex-col items-center lg:items-start text-center lg:text-left gap-5 max-w-xl order-last lg:order-first">
          <div className="flex flex-wrap justify-center lg:justify-start gap-3">
            <Badge variant="hero">
              <Zap className="text-secondary fill-secondary" />
              30-45 min
            </Badge>
            <Badge variant="hero">
              <Bike className="text-secondary fill-secondary" />
              Envío económico
            </Badge>
            <Badge variant="hero">
              <Phone className="text-secondary fill-secondary" />
              Atención 24h
            </Badge>
          </div>

          <h1 className="text-headline-lg text-3xl lg:text-7xl uppercase tracking-tight text-white leading-tight">
            Pide tu comida
            <br />
            <span className="text-secondary">favorita</span>
          </h1>

          <p className="text-body-sm lg:text-body-lg text-white/90 max-w-md">
            Los mejores sabores latinos directo a tu puerta. Frescura, rapidez y el sazón que te hace sentir en casa.
          </p>

          <div className="flex flex-col lg:flex-row gap-3 w-full">
            <BuyModal />
            <PickupModal />
          </div>
        </div>

        <div className="relative hidden lg:flex justify-center shrink-0 w-full max-w-[500px]">
          <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl scale-90" />
          <div className="relative w-full max-w-[500px] aspect-square rotate-2">
            <Image
              src={heroImage}
              alt="Comida latina recién hecha"
              fill
              sizes="(min-width: 768px) 500px, 0px"
              priority
              className="object-cover rounded-3xl shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}