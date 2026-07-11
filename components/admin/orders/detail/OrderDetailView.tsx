import { OrderStatusBanner } from "./OrderStatusBanner"
import { OrderGeneralInfoCard } from "./OrderGeneralInfoCard"
import { OrderItemsCard } from "./OrderItemsCard"
import { OrderPaymentMethodCard } from "./OrderPaymentMethodCard"
import { OrderPickupReferenceCard } from "./OrderPickupReferenceCard"
import { OrderTotalsCard } from "./OrderTotalsCard"
import { OrderActionsCard } from "./OrderActionsCard"
import { MobileContactBar } from "./MobileContactBar"
import type { OrderWithClient } from "@/lib/types"

interface OrderDetailViewProps {
  order: OrderWithClient
}

function getItemsSubtotalCents(order: OrderWithClient): number {
  return order.items.reduce(
    (sum, item) => sum + item.quantity * item.estimated_unit_price,
    0
  )
}

export function OrderDetailView({ order }: OrderDetailViewProps) {
  const itemsSubtotalCents = getItemsSubtotalCents(order)
  const deliveryFeeCents = order.total_amount - itemsSubtotalCents
  const showImages =
    order.status !== "delivered" && order.status !== "cancelled"
  const isBuyOrder = order.service_type === "buy_and_deliver"
  const pickupReference = order.pickup_reference ?? ""

  return (
    <div className="space-y-4 sm:space-y-6 pb-24 lg:pb-0">
      <OrderStatusBanner status={order.status} createdAt={order.created_at} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <OrderGeneralInfoCard order={order} />
          {isBuyOrder ? (
            <OrderItemsCard items={order.items} showImages={showImages} />
          ) : (
            <OrderPickupReferenceCard className="pt-4" reference={pickupReference} />
          )}
          <OrderPaymentMethodCard order={order} />
        </div>

        {/* Right column */}
        <div className="space-y-4 sm:space-y-6">
          <OrderTotalsCard
            itemsSubtotalCents={itemsSubtotalCents}
            deliveryFeeCents={deliveryFeeCents}
            totalCents={order.total_amount}
          />
          <OrderActionsCard order={order} />
        </div>
      </div>

      <MobileContactBar client={order.client} />
    </div>
  )
}
