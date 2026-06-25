import { notFound } from "next/navigation"
import { Package } from "lucide-react"

import { getOrderByNumberWithDetails } from "@/lib/actions/orders"
import {
  OrderDetailHeader,
  OrderDetailView,
} from "@/components/admin/orders/detail"
import { formatOrderDate } from "@/lib/orders/format"

interface PageProps {
  params: Promise<{ orderNumber: string }>
}

export const dynamic = "force-dynamic"

export async function generateMetadata({ params }: PageProps) {
  const { orderNumber } = await params
  return {
    title: `Pedido #${orderNumber} · Los Latinos Admin`,
  }
}

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { orderNumber: orderNumberRaw } = await params
  const orderNumber = Number.parseInt(orderNumberRaw, 10)
  if (Number.isNaN(orderNumber) || orderNumber <= 0) {
    notFound()
  }

  const order = await getOrderByNumberWithDetails(orderNumber)
  if (!order) {
    notFound()
  }

  return (
    <div className="space-y-4 sm:space-y-6 mx-auto max-w-7xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Package className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">
            Detalle de Pedido
          </h1>
          <p className="text-body-sm text-on-surface-variant">
            Información completa del pedido #{orderNumber}
          </p>
        </div>
      </div>

      <OrderDetailHeader
        orderNumber={orderNumber}
        subtitle={`Creado el ${formatOrderDate(order.created_at)}`}
      />

      <OrderDetailView order={order} />
    </div>
  )
}
