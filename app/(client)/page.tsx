"use client"

import { useState } from "react"
import { HeroSection } from "@/components/home/HeroSection"
import { DailyOffersBanner } from "@/components/home/DailyOffersBanner"
import { PopularRestaurants } from "@/components/home/PopularRestaurants"

export default function ClientHomePage() {
  const [selectedAction, setSelectedAction] = useState<"buy" | "pickup" | null>(null)

  return (
    <>
      <HeroSection
        onBuyClick={() => setSelectedAction("buy")}
        onPickupClick={() => setSelectedAction("pickup")}
      />
      <DailyOffersBanner />
      <PopularRestaurants />
    </>
  )
}