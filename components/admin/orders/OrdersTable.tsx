"use client"

import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { OrderStatusBadge } from "./OrderStatusBadge"
import { Button } from "@/components/ui/button"
import { Eye, Check, Truck, X, MapPin, CheckCircle } from "lucide-react"
import type { Order } from "@/lib/types"
import type { RiderProfile } from "@/lib/actions/orders"
import { formatCurrency, formatOrderDateOnly, formatOrderTimeOnly } from "@/lib/orders/format"

interface OrdersTableProps {
  orders: Order[]
  riders: RiderProfile[]
  onViewDetails: (orderId: string) => void
  onAcceptOrder: (orderId: string) => void
  onStartDelivery: (orderId: string) => void
  onArriveAtCustomer: (orderId: string) => void
  onCompleteOrder: (orderId: string) => void
  onUnassignOrder: (orderId: string) => void
}

export function OrdersTable({
  orders,
  riders,
  onViewDetails,
  onAcceptOrder,
  onStartDelivery,
  onArriveAtCustomer,
  onCompleteOrder,
  onUnassignOrder,
}: OrdersTableProps) {
  const getRiderName = (riderId: string | null) => {
    if (!riderId) return null
    const rider = riders.find((r) => r.id === riderId)
    return rider ? `${rider.first_name} ${rider.last_name}` : null
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-surface-container-low hover:bg-surface-container-low">
          <TableHead className="w-20">ID</TableHead>
          <TableHead>Fecha</TableHead>
          <TableHead>Recogida / Entrega</TableHead>
          <TableHead>Rider</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="w-12 text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="h-32 text-center">
              <div className="mx-auto max-w-md">
                <p className="text-body-md text-on-surface-variant">
                  No hay pedidos registrados
                </p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          orders.map((order) => (
            <TableRow
              key={order.id}
              className={cn(
                "transition-colors",
                order.status === "pending" &&
                "bg-warning/5 hover:bg-warning/10",
                order.status === "assigned" &&
                "bg-warning/5 hover:bg-warning/10",
                order.status === "on_the_way" &&
                "bg-info/5 hover:bg-info/10",
                order.status === "at_customer" &&
                "bg-info/5 hover:bg-info/10",
                order.status === "delivered" &&
                "bg-success/5 hover:bg-success/10",
                order.status === "cancelled" &&
                "bg-destructive/5 hover:bg-destructive/10"
              )}
            >
              <TableCell className="font-semibold">
                #{order.order_number}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-body-md">
                    {formatOrderDateOnly(order.created_at)}
                  </span>
                  <span className="text-label-md text-on-surface-variant">
                    {formatOrderTimeOnly(order.created_at)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col max-w-xs">
                  <span className="font-medium truncate">
                    {order.custom_store_name || order.pickup_reference || "Sin tienda"}
                  </span>
                  <span className="text-label-md text-on-surface-variant truncate">
                    {order.delivery_address_line || "Sin dirección de entrega"}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                {order.rider_id ? (
                  <span className="text-body-md">{getRiderName(order.rider_id)}</span>
                ) : (
                  <span className="text-body-md text-on-surface-variant italic">
                    Sin asignar
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right font-semibold text-primary font-bold">
                {formatCurrency(order.total_amount)}
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    onClick={() => onViewDetails(order.id)}
                    title="Ver detalles"
                  >
                    <Eye className="size-4" />
                  </Button>

                  {order.status === "pending" && (
                    <Button
                      variant="success"
                      size="icon-sm"
                      onClick={() => onAcceptOrder(order.id)}
                      title="Aceptar pedido"
                    >
                      <Check className="size-4" />
                    </Button>
                  )}

                  {order.status === "assigned" && (
                    <>
                      <Button
                        variant="info"
                        size="icon-sm"
                        onClick={() => onStartDelivery(order.id)}
                        title="Iniciar entrega"
                      >
                        <Truck className="size-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        onClick={() => onUnassignOrder(order.id)}
                        title="Desasignar"
                      >
                        <X className="size-4" />
                      </Button>
                    </>
                  )}

                  {order.status === "on_the_way" && (
                    <Button
                      variant="info"
                      size="icon-sm"
                      onClick={() => onArriveAtCustomer(order.id)}
                      title="Llegué al cliente"
                    >
                      <MapPin className="size-4" />
                    </Button>
                  )}

                  {order.status === "at_customer" && (
                    <Button
                      variant="success"
                      size="icon-sm"
                      onClick={() => onCompleteOrder(order.id)}
                      title="Marcar completado"
                    >
                      <CheckCircle className="size-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}
