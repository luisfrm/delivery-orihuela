import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { getOrdersWithDetails } from "@/lib/actions/orders"
import { OrderList } from "@/components/orders/OrderList"

export const metadata = {
  title: "Mis pedidos",
}

export default async function PedidosPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/")
  }

  const orders = await getOrdersWithDetails()

  return (
    <div className="max-w-7xl px-4 lg:px-6 pt-4 pb-6">
      <OrderList initialOrders={orders} userId={user.id} />
    </div>
  )
}