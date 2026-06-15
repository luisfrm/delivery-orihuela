"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"

import { ActiveOrderCard } from "@/components/orders/ActiveOrderCard"
import { EmptyOrdersState } from "@/components/orders/EmptyOrderState"
import { RecentOrdersSection } from "@/components/orders/RecentOrdersSection"
import type { ListCardProps } from "@/components/shared/ListCard"
import type { Order } from "@/lib/types"
import {
  ORDER_STATUS_CONFIG,
  SERVICE_TYPE_CONFIG,
  isActiveOrder,
} from "@/lib/orders/order-status"
import { formatCurrency, formatOrderDate, shortOrderId } from "@/lib/orders/format"
import { createClient } from "@/lib/supabase/client"

export interface OrderListProps {
  initialOrders: Order[]
  userId: string
}

export function OrderList({ initialOrders, userId }: OrderListProps) {
  const router = useRouter()
  const [orders, setOrders] = useState(initialOrders)

  // --- Realtime opcional: actualiza la lista cuando cambia el estado de un pedido ---
  // Si no tienes "@/lib/supabase/client" o no necesitas live updates, borra este bloque.
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`orders-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `client_id=eq.${userId}`,
        },
        (payload) => {
          setOrders((current) => {
            if (payload.eventType === "DELETE") {
              return current.filter((o) => o.id !== (payload.old as Order).id)
            }
            const updated = payload.new as Order
            const exists = current.some((o) => o.id === updated.id)
            return exists
              ? current.map((o) => (o.id === updated.id ? updated : o))
              : [updated, ...current]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])
  // --- fin bloque opcional ---

  const { activeOrders, historyOrders } = useMemo(() => {
    const active: Order[] = []
    const history: Order[] = []

    for (const order of orders) {
      if (isActiveOrder(order.status)) {
        active.push(order)
      } else {
        history.push(order)
      }
    }

    return { activeOrders: active, historyOrders: history }
  }, [orders])

  if (orders.length === 0) {
    return <EmptyOrdersState onBrowse={() => router.push("/")} />
  }

  const historyItems: (ListCardProps & { id: string })[] = historyOrders.map(
    (order) => {
      const status = ORDER_STATUS_CONFIG[order.status]
      const service = SERVICE_TYPE_CONFIG[order.service_type]
      const ServiceIcon = service.icon

      return {
        id: order.id,
        icon: <ServiceIcon className="size-7" />,
        title: order.custom_store_name ?? `Pedido #${shortOrderId(order.id)}`,
        subtitle: `${formatOrderDate(order.created_at)} • ${formatCurrency(order.total_amount)}`,
        description: order.pickup_reference ?? service.label,
        badge: { label: status.label, variant: status.badgeVariant },
        action: {
          label: "Ver detalles",
          icon: <ArrowRight />,
          variant: "secondary",
          onClick: () => router.push(`/pedidos/${order.id}`),
        },
      }
    }
  )

  return (
    <div className="space-y-6 sm:space-y-8">
      {activeOrders.length > 0 && (
        <section className="space-y-4">
          {activeOrders.length > 1 && (
            <h2 className="text-headline-md text-on-surface">En curso</h2>
          )}
          <div className="flex flex-col gap-4">
            {activeOrders.map((order) => (
              <ActiveOrderCard
                key={order.id}
                order={order}
                onViewDetails={(id) => router.push(`/pedidos/${id}`)}
                onContactDriver={(id) => router.push(`/pedidos/${id}/chat`)}
              />
            ))}
          </div>
        </section>
      )}

      {historyOrders.length > 0 && (
        <RecentOrdersSection title="Historial de pedidos" items={historyItems} />
      )}
    </div>
  )
}