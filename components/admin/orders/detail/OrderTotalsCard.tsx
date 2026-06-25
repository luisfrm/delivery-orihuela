import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCurrency } from "@/lib/orders/format"

interface OrderTotalsCardProps {
  itemsSubtotalCents: number
  deliveryFeeCents: number
  totalCents: number
  className?: string
}

export function OrderTotalsCard({
  itemsSubtotalCents,
  deliveryFeeCents,
  totalCents,
  className,
}: OrderTotalsCardProps) {
  return (
    <Card variant="primary" className={className}>
      <CardHeader>
        <CardTitle>Resumen de Pago</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2.5 text-body-md">
          <div className="flex justify-between">
            <dt className="text-on-primary-container/80">Subtotal</dt>
            <dd className="text-on-primary-container font-medium">
              {formatCurrency(itemsSubtotalCents)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-on-primary-container/80">Costo de Envío</dt>
            <dd className="text-on-primary-container font-medium">
              {formatCurrency(deliveryFeeCents)}
            </dd>
          </div>
        </dl>
        <div className="mt-4 pt-3 border-t border-on-primary-container/20 flex items-center justify-between">
          <span className="text-title-lg font-bold text-on-primary-container">
            Total
          </span>
          <span className="text-headline-md font-bold text-on-primary-container">
            {formatCurrency(totalCents)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
