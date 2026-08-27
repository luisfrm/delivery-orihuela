import { getAdminOrdersCounts, getAdminOrdersPage, getRiders } from "@/lib/actions/orders"
import { AdminOrdersManager } from "@/components/admin/orders/AdminOrdersManager"
import { Package } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminOrdersPage() {
  const pageSize = 25
  const [initialPage, counts, riders] = await Promise.all([
    getAdminOrdersPage({
      statuses: ["pending", "assigned", "at_customer", "on_the_way"],
      offset: 0,
      limit: pageSize,
      dateFilter: "all",
    }),
    getAdminOrdersCounts("all"),
    getRiders(),
  ])

  const total = counts.total

  return (
    <div className="space-y-6 mx-auto max-w-7xl ">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Package className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">Pedidos</h1>
          <p className="text-body-sm text-on-surface-variant">
            {total > 0 ? `${total} pedido${total !== 1 ? "s" : ""}` : "Gestiona los pedidos del sistema"}
          </p>
        </div>
      </div>

      <AdminOrdersManager
        initialOrders={initialPage.orders}
        initialHasMore={initialPage.hasMore}
        initialCounts={counts}
        initialTotal={initialPage.total}
        riders={riders}
        pageSize={pageSize}
      />
    </div>
  )
}