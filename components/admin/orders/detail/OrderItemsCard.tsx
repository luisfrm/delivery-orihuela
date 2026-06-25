import Image from "next/image"
import { ShoppingBag } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { formatCurrency } from "@/lib/orders/format"
import type { OrderItemWithProduct } from "@/lib/types"
import { cn } from "@/lib/utils"

interface OrderItemsCardProps {
  items: OrderItemWithProduct[]
  /** Si es true, muestra la imagen del producto. False para delivered/cancelled. */
  showImages: boolean
  className?: string
}

export function OrderItemsCard({
  items,
  showImages,
  className,
}: OrderItemsCardProps) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="size-5 text-primary" />
            <CardTitle>Artículos del Pedido</CardTitle>
          </div>
          <span className="text-label-md text-on-surface-variant">
            {totalItems} {totalItems === 1 ? "artículo" : "artículos"}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant text-center py-4">
            Sin artículos
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg bg-surface-container-low"
                )}
              >
                {showImages && item.product_picture_url ? (
                  <div className="relative w-12 h-12 shrink-0 rounded-md overflow-hidden bg-surface-variant">
                    <Image
                      src={item.product_picture_url}
                      alt={item.product_name ?? "Producto"}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 shrink-0 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                    <span className="text-label-md font-bold">
                      {item.quantity}×
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-body-md text-on-surface truncate">
                    {item.product_name ?? "Producto eliminado"}
                  </p>
                  <p className="text-label-md text-on-surface-variant">
                    {item.quantity} × {formatCurrency(item.estimated_unit_price)}
                  </p>
                </div>
                <p className="font-bold text-body-md text-on-surface shrink-0">
                  {formatCurrency(item.quantity * item.estimated_unit_price)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
