"use client"

import { Package, Truck } from "lucide-react"
import {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
} from "@/components/ui/responsive-modal"
import { PickupForm } from "@/components/forms/pickup-form"
import { Button } from "@/components/ui/button"

export default function PickupModal() {
  return (
    <ResponsiveModal>
      <ResponsiveModalTrigger asChild>
        <Button variant="outline" size="xl" className="w-full lg:w-auto">
          <Truck className="w-5 h-5" />
          Recoger
        </Button>
      </ResponsiveModalTrigger>

      <ResponsiveModalContent
        icon={<Package className="size-[18px]" />}
        title="Solicitar Recogida"
        subtitle="Recoge un pedido que ya tienes listo"
        desktopMaxWidth="max-w-md"
      >
        <PickupForm />
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}