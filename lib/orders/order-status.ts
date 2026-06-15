import { Clock, CheckCircle, Truck, Store, XCircle, Package } from "lucide-react"
import type { OrderStatus, ServiceType } from "@/lib/types"

export const ORDER_STATUS_CONFIG: Record<OrderStatus, {
  label: string
  icon: React.ComponentType<{ className?: string }>
  badgeVariant: "default" | "secondary" | "destructive" | "success" | "warning"
}> = {
  pending: { label: "Pendiente", icon: Clock, badgeVariant: "warning" },
  assigned: { label: "Asignado", icon: Package, badgeVariant: "default" },
  at_store: { label: "En tienda", icon: Store, badgeVariant: "secondary" },
  on_the_way: { label: "En camino", icon: Truck, badgeVariant: "default" },
  delivered: { label: "Entregado", icon: CheckCircle, badgeVariant: "success" },
  cancelled: { label: "Cancelado", icon: XCircle, badgeVariant: "destructive" },
}

export const SERVICE_TYPE_CONFIG: Record<ServiceType, {
  label: string
  icon: React.ComponentType<{ className?: string }>
}> = {
  pickup_only: { label: "Recogida", icon: Store },
  buy_and_deliver: { label: "Comprar y entregar", icon: Package },
}

export function isActiveOrder(status: OrderStatus): boolean {
  return !["delivered", "cancelled"].includes(status)
}