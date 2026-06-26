"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { PackageCheck } from "lucide-react"

import { ActiveOrderCard } from "@/components/orders/ActiveOrderCard"
import { EmptyOrdersState } from "@/components/orders/EmptyOrderState"
import { OrdersSectionHeader } from "@/components/orders/OrdersSectionHeader"
import { RecentOrdersSection } from "@/components/orders/RecentOrdersSection"
import { RefreshButton } from "@/components/shared/RefreshButton"
import { isActiveOrder } from "@/lib/orders/order-status"
import type {
  ActiveOrderData,
  OrderHistoryData,
  OrderWithDetails,
} from "@/lib/types"
import { getOrdersWithDetails } from "@/lib/actions/orders"

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
    items_estimated_cost: order.items_estimated_cost,
    delivery_fee: order.delivery_fee,
    total_amount: order.total_amount,
    rider: order.rider,
  }
}

function toHistoryOrder(order: OrderWithDetails): OrderHistoryData {
  return {
    id: order.id,
    order_number: order.order_number,
    created_at: order.created_at,
    status: order.status,
    service_type: order.service_type,
    custom_store_name: order.custom_store_name,
    storeName: order.storeName,
    deliveryAddress: order.deliveryAddress
      ? {
        name: order.deliveryAddress.name,
        address_line: order.deliveryAddress.address_line,
      }
      : null,
    items: order.items.map((item) => ({
      id: item.id,
      product_name: item.product_name,
      quantity: item.quantity,
      estimated_unit_price: item.estimated_unit_price,
    })),
    additional_notes: order.additional_notes,
    items_estimated_cost: order.items_estimated_cost,
    delivery_fee: order.delivery_fee,
    total_amount: order.total_amount,
    rider: order.rider,
  }
}

export function OrderList({ initialOrders }: OrderListProps) {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderWithDetails[]>(initialOrders)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOrders(initialOrders)
  }, [initialOrders])

  const handleRefresh = useCallback(async () => {
    const updated = await getOrdersWithDetails()
    setOrders(updated)
  }, [])

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
    <div className="space-y-6 sm:space-y-8 mx-auto">
      <div className="flex items-center justify-end">
        <RefreshButton onRefresh={handleRefresh} />
      </div>

      {activeOrders.length > 0 && (
        <section className="space-y-4">
          <OrdersSectionHeader
            icon={PackageCheck}
            title="Pedidos en Curso"
          />
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 pt-4">
            {activeOrders.map((order) => (
              <ActiveOrderCard key={order.id} order={order} />
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
