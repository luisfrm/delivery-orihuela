import { FileText } from "lucide-react"

import {
  Card,
  CardContent,
} from "@/components/ui/card"

interface OrderPickupReferenceCardProps {
  /** Referencia del pedido (ej: "Pedido #1234, Encargo de Juan"). */
  reference: string
  className?: string
}

export function OrderPickupReferenceCard({
  reference,
  className,
}: OrderPickupReferenceCardProps) {
  if (!reference) return null

  return (
    <Card className={className}>
      <CardContent>
        <div className="flex items-start gap-3">
          <FileText className="size-5 text-primary shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
              Referencia del pedido
            </p>
            <p className="text-body-md font-normal text-on-surface break-words">
              {reference}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
