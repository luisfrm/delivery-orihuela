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
  store: "Paso 1 de 5 · Selección",
  menu: "Paso 2 de 5 · Menú",
  address: "Paso 3 de 5 · Entrega",
  payment: "Paso 4 de 5 · Pago",
  preview: "Paso 5 de 5 · Confirmar",
  success: "Pedido enviado",
}

interface BuyModalProps {
  /** Controlled open state. If provided, the modal is in controlled mode. */
  open?: boolean
  /** Notifies the parent when the modal should be opened/closed. */
  onOpenChange?: (open: boolean) => void
  /** Custom trigger element (e.g. a Button with `disabled` while auth is loading). */
  trigger?: React.ReactNode
}

export default function BuyModal({
  open,
  onOpenChange,
  trigger,
}: BuyModalProps) {
  const [step, setStep] = useState<string>("store")

  const subtitle = STEP_SUBTITLES[step] ?? STEP_SUBTITLES.store

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      {trigger !== undefined ? (
        <ResponsiveModalTrigger asChild>{trigger}</ResponsiveModalTrigger>
      ) : (
        <ResponsiveModalTrigger asChild>
          <Button
            variant="secondary"
            size="xl"
            className="w-full lg:w-auto"
          >
            <ShoppingBag className="w-5 h-5" />
            Comprar
          </Button>
        </ResponsiveModalTrigger>
      )}

      <ResponsiveModalContent
        icon={<ShoppingCart className="size-[18px]" />}
        title="Comprar"
        subtitle={subtitle}
        desktopMaxWidth="max-w-xl"
        bodyClassName="p-0 overflow-hidden flex flex-col"
      >
        <BuyForm onStepChange={setStep} />
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
