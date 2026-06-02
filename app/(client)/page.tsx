"use client"

import { useState } from "react"
import { HeroSection } from "@/components/home/HeroSection"
import { DailyOffersBanner } from "@/components/home/DailyOffersBanner"
import { PopularRestaurants } from "@/components/home/PopularRestaurants"

export default function ClientHomePage() {
  const [selectedAction, setSelectedAction] = useState<"buy" | "pickup" | null>(null)
  
  // NOTE: selectedAction state remains available for future routing or modal state handling

  return (
    <>
      <HeroSection
        onPickupClick={() => setSelectedAction("pickup")}
      />
      <DailyOffersBanner />
      <PopularRestaurants />
    </>
  )
}