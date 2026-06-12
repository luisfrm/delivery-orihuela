"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"
import { toast } from "sonner"
import { HeroSection } from "@/components/home/HeroSection"
import { DailyOffersBanner } from "@/components/home/DailyOffersBanner"
import { PopularRestaurants } from "@/components/home/PopularRestaurants"

function UnauthorizedHandler() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const unauthorized = searchParams.get("unauthorized")

    if (unauthorized === "login_required") {
      toast.error("Inicia sesión para acceder a esa página")
    } else if (unauthorized === "forbidden") {
      toast.error("No tienes permisos para acceder a esa página")
    }
  }, [searchParams])

  return null
}

export default function ClientHomePage() {
  return (
    <>
      <Suspense>
        <UnauthorizedHandler />
      </Suspense>
      <HeroSection />
      <DailyOffersBanner />
      <PopularRestaurants />
    </>
  )
}