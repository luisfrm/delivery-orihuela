"use client"

import { useState } from "react"
import { Order } from "@/lib/types"
import { useOrders } from "@/hooks/useOrders"
import { OrderCard } from "./OrderCard"
import { OrderDetail } from "./OrderDetail"
import { OrderEmptyState } from "./OrderEmptyState"
import { cancelOrder } from "@/lib/actions/orders"
import { toast } from "sonner"

interface OrderListProps {
  initialOrders: Order[]
  userId: string
}

export function OrderList({ initialOrders, userId }: OrderListProps) {
  const { orders, isLoading, refresh } = useOrders({ initialOrders, userId })
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const handleCancel = async (orderId: string) => {
    const result = await cancelOrder(orderId)
    if (result?.error) {
      toast.error(result.error)
    } else {
      toast.success("Pedido cancelado")
      await refresh()
    }
  }

  if (!isLoading && orders.length === 0) {
    return <OrderEmptyState />
  }

  return (
    <div className="space-y-3">
      {isLoading && (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onClick={() => setSelectedOrder(order)}
        />
      ))}

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-surface-container-low w-full max-w-md rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1 rounded-full bg-outline mx-auto mb-4" />
            <OrderDetail
              order={selectedOrder}
              onClose={() => setSelectedOrder(null)}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}
    </div>
  )
}