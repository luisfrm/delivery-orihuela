"use client"

import { HeroSection } from "@/components/home/HeroSection"
import { DailyOffersBanner } from "@/components/home/DailyOffersBanner"
import { PopularRestaurants } from "@/components/home/PopularRestaurants"

export default function ClientHomePage() {
  return (
    <>
      <HeroSection />
      <DailyOffersBanner />
      <PopularRestaurants />
    </>
  )
}