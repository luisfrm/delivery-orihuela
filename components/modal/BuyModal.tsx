"use client"

import { useState } from "react"
import { ShoppingBag, ShoppingCart } from "lucide-react"
import {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
} from "@/components/ui/responsive-modal"
import { BuyForm } from "@/components/forms/BuyForm"
import { Button } from "@/components/ui/button"

const STEP_SUBTITLES: Record<string, string> = {
  store: "Paso 1 de 4 · Selección",
  menu: "Paso 2 de 4 · Menú",
  address: "Paso 3 de 4 · Entrega",
  preview: "Paso 4 de 4 · Confirmar",
  success: "Pedido enviado",
}

interface BuyModalProps {
  onTriggerClick?: () => void
}

export default function BuyModal({ onTriggerClick }: BuyModalProps) {
  const [step, setStep] = useState<string>("store")

  const subtitle = STEP_SUBTITLES[step] ?? STEP_SUBTITLES.store

  return (
    <ResponsiveModal>
      <ResponsiveModalTrigger asChild>
        <Button
          variant="secondary"
          size="xl"
          className="w-full lg:w-auto"
          onClick={onTriggerClick}
        >
          <ShoppingBag className="w-5 h-5" />
          Comprar
        </Button>
      </ResponsiveModalTrigger>

      <ResponsiveModalContent
        icon={<ShoppingCart className="size-[18px]" />}
        title="Comprar"
        subtitle={subtitle}
        desktopMaxWidth="max-w-md"
      >
        <BuyForm onStepChange={setStep} />
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
