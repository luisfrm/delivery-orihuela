import { getActiveAdminOrders, getRiders } from "@/lib/actions/orders"
import { AdminOrdersManager } from "@/components/admin/orders/AdminOrdersManager"
import { Package } from "lucide-react"

export default async function AdminOrdersPage() {
  const [orders, riders] = await Promise.all([getActiveAdminOrders(), getRiders()])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Package className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">Pedidoss</h1>
          <p className="text-body-sm text-on-surface-variant">
            {orders.length > 0
              ? `${orders.length} pedido${orders.length !== 1 ? "s" : ""}`
              : "Gestiona los pedidos del sistema"}
          </p>
        </div>
      </div>

      <AdminOrdersManager initialOrders={orders} riders={riders} />
    </div>
  )
}