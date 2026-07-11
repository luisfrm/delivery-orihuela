"use client"

import { Phone } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  formatPhoneForCall,
  formatPhoneForWhatsApp,
} from "@/lib/orders/format"
import type { RiderContact } from "@/lib/types"
import { cn } from "@/lib/utils"
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon"

interface ContactRiderActionsProps {
  rider: RiderContact
  className?: string
  /** Muestra el nombre del rider arriba de los botones. Default: true */
  showName?: boolean
  /** Variante del tamaño de los botones. Default: "sm" */
  size?: "sm" | "default" | "lg"
}

export function ContactRiderActions({
  rider,
  className,
  showName = true,
  size = "sm",
}: ContactRiderActionsProps) {
  const fullName = [rider.first_name, rider.last_name]
    .filter(Boolean)
    .join(" ")
    .trim()
  const whatsappUrl = `https://wa.me/${formatPhoneForWhatsApp(rider.phone)}`
  const callUrl = `tel:${formatPhoneForCall(rider.phone)}`

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {showName && fullName && (
        <p className="text-label-md text-on-surface-variant">
          Tu repartidor:{" "}
          <span className="font-semibold text-on-surface">{fullName}</span>
        </p>
      )}
      <div className="flex gap-2">
        <Button
          variant="success"
          size={size}
          className="flex-1"
          nativeButton={false}
          render={
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
        >
          <WhatsAppIcon className="size-4" />
          WhatsApp
        </Button>
        <Button
          variant="outline_primary"
          size={size}
          className="flex-1"
          nativeButton={false}
          render={<a href={callUrl} />}
        >
          <Phone className="size-4" />
          Llamar
        </Button>
      </div>
    </div>
  )
}
