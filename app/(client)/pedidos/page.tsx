import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getOrders } from "@/lib/actions/orders"
import { OrderList } from "@/components/orders/OrderList"
import { Package } from "lucide-react"

export default async function PedidosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  const orders = await getOrders()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Package className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">Mis Pedidos</h1>
          <p className="text-body-sm text-on-surface-variant">
            {orders.length > 0
              ? `${orders.length} pedido${orders.length !== 1 ? "s" : ""}`
              : "Sin pedidos aún"}
          </p>
        </div>
      </div>

      <OrderList initialOrders={orders} userId={user.id} />
    </div>
  )
}