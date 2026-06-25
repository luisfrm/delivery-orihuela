"use client"

import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PickupPreviewSuccessProps {
  orderId: string
}

export function PickupPreviewSuccess({ orderId }: PickupPreviewSuccessProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <CheckCircle className="size-8 text-primary" />
      </div>
      <h3 className="text-headline-md font-bold text-on-surface mb-2">
        Pedido en espera
      </h3>
      <p className="text-body-md text-muted-foreground mb-2 max-w-xs">
        Tu solicitud ha sido enviada. Un rider aceptará tu pedido pronto.
      </p>
      <p className="text-label-md text-muted-foreground mb-6">
        ID: <span className="font-mono">{orderId.slice(0, 8)}</span>
      </p>
      <a
        href="/pedidos"
        className="text-primary font-bold hover:underline mb-4"
      >
        Ver mis pedidos
      </a>
      <div className="pt-2">
        <Button
          variant="outline_primary"
          size="lg"
          onClick={() => window.location.reload()}
        >
          Cerrar
        </Button>
      </div>
    </div>
  )
}
