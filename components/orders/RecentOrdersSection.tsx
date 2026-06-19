import { History } from "lucide-react"

import { OrderHistoryListItem } from "@/components/orders/OrderHistoryListItem"
import { OrdersSectionHeader } from "@/components/orders/OrdersSectionHeader"
import type { OrderHistoryData } from "@/lib/types"

export interface RecentOrdersSectionProps {
  title?: string
  orders: OrderHistoryData[]
  className?: string
}

export function RecentOrdersSection({
  title = "Historial de pedidos",
  orders,
  className,
}: RecentOrdersSectionProps) {
  return (
    <section className={className}>
      <OrdersSectionHeader
        icon={History}
        title={title}
        iconClassName="text-secondary"
      />
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pt-4">
        {orders.map((order) => (
          <OrderHistoryListItem key={order.id} order={order} />
        ))}
      </div>
    </section>
  )
}
