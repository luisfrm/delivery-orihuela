import { Utensils } from "lucide-react"

import { getAdminStores } from "@/lib/actions/stores"
import { AddRestaurantButton } from "@/components/admin/restaurants/AddRestaurantButton"
import { AdminRestaurantsGrid } from "@/components/admin/restaurants/AdminRestaurantsGrid"

export default async function AdminRestaurantsPage() {
  const stores = await getAdminStores()

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Utensils className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-headline-lg font-bold text-on-surface">Restaurantes</h1>
            <p className="text-body-sm text-on-surface-variant">
              {stores.length > 0
                ? `${stores.length} restaurante${stores.length !== 1 ? "s" : ""} registrado${stores.length !== 1 ? "s" : ""}`
                : "Gestiona los restaurantes aliados"}
            </p>
          </div>
        </div>

        <AddRestaurantButton />
      </div>

      <AdminRestaurantsGrid stores={stores} />
    </div>
  )
}
