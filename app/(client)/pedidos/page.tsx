import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getOrders } from "@/lib/actions/orders"
import { OrderList } from "@/components/orders/OrderList"

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
      <OrderList initialOrders={orders} userId={user.id} />
    </div>
  )
}