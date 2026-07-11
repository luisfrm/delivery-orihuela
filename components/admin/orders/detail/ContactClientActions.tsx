import { Phone } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  formatPhoneForCall,
  formatPhoneForWhatsApp,
} from "@/lib/orders/format"
import type { ClientContact } from "@/lib/types"
import { cn } from "@/lib/utils"
import { WhatsAppIcon } from "@/components/shared/WhatsAppIcon"

interface ContactClientActionsProps {
  client: ClientContact
  className?: string
  /** Variante del tamaño de los botones. Default: "sm" */
  size?: "sm" | "default" | "lg"
  /** Layout vertical (columna) u horizontal (fila). Default: "horizontal" */
  orientation?: "horizontal" | "vertical"
}

export function ContactClientActions({
  client,
  className,
  size = "sm",
  orientation = "horizontal",
}: ContactClientActionsProps) {
  const whatsappUrl = `https://wa.me/${formatPhoneForWhatsApp(client.phone)}`
  const callUrl = `tel:${formatPhoneForCall(client.phone)}`

  if (!client.phone) return null

  return (
    <div
      className={cn(
        orientation === "vertical"
          ? "flex flex-col gap-2"
          : "flex flex-row gap-2",
        className
      )}
    >
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
  )
}
