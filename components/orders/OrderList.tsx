"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { PackageCheck } from "lucide-react"

import { ActiveOrderCard } from "@/components/orders/ActiveOrderCard"
import { EmptyOrdersState } from "@/components/orders/EmptyOrderState"
import { OrdersSectionHeader } from "@/components/orders/OrdersSectionHeader"
import { RecentOrdersSection } from "@/components/orders/RecentOrdersSection"
import { isActiveOrder } from "@/lib/orders/order-status"
import type {
  ActiveOrderData,
  OrderHistoryData,
  OrderWithDetails,
} from "@/lib/types"

export interface OrderListProps {
  initialOrders: OrderWithDetails[]
}

function toActiveOrder(order: OrderWithDetails): ActiveOrderData {
  return {
    id: order.id,
    order_number: order.order_number,
    created_at: order.created_at,
    status: order.status,
    service_type: order.service_type,
    rider_id: order.rider_id,
    custom_store_name: order.custom_store_name,
    storeName: order.storeName,
    deliveryAddress: order.deliveryAddress,
    items: order.items.map((item) => ({
      id: item.id,
      product_name: item.product_name,
      product_picture_url: item.product_picture_url,
      quantity: item.quantity,
      estimated_unit_price: item.estimated_unit_price,
    })),
    additional_notes: order.additional_notes,
    total_amount: order.total_amount,
  }
}

function toHistoryOrder(order: OrderWithDetails): OrderHistoryData {
  return {
    id: order.id,
    created_at: order.created_at,
    status: order.status,
    service_type: order.service_type,
    custom_store_name: order.custom_store_name,
    storeName: order.storeName,
    deliveryAddress: order.deliveryAddress
      ? { name: order.deliveryAddress.name }
      : null,
    items: order.items.map((item) => ({
      id: item.id,
      product_name: item.product_name,
      quantity: item.quantity,
      estimated_unit_price: item.estimated_unit_price,
    })),
    additional_notes: order.additional_notes,
    total_amount: order.total_amount,
  }
}

export function OrderList({ initialOrders }: OrderListProps) {
  const router = useRouter()
  const orders = initialOrders

  const { activeOrders, historyOrders } = useMemo(() => {
    const active: ActiveOrderData[] = []
    const history: OrderHistoryData[] = []

    for (const order of orders) {
      if (isActiveOrder(order.status)) {
        active.push(toActiveOrder(order))
      } else {
        history.push(toHistoryOrder(order))
      }
    }

    return { activeOrders: active, historyOrders: history }
  }, [orders])

  if (orders.length === 0) {
    return <EmptyOrdersState onBrowse={() => router.push("/")} />
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {activeOrders.length > 0 && (
        <section className="space-y-4">
          <OrdersSectionHeader
            icon={PackageCheck}
            title="Pedidos en Curso"
          />
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 pt-4">
            {activeOrders.map((order) => (
              <ActiveOrderCard
                key={order.id}
                order={order}
                onContactDriver={(id) => router.push(`/pedidos/${id}/chat`)}
              />
            ))}
          </div>
        </section>
      )}

      {historyOrders.length > 0 && (
        <RecentOrdersSection
          title="Historial de Pedidos"
          orders={historyOrders}
        />
      )}
    </div>
  )
}
