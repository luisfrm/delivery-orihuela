import type { StoreWithMetadata } from "@/lib/types"
import { RestaurantCard } from "./RestaurantCard"
import { EmptyRestaurantsState } from "./EmptyRestaurantsState"

interface AdminRestaurantsGridProps {
  stores: StoreWithMetadata[]
}

export function AdminRestaurantsGrid({ stores }: AdminRestaurantsGridProps) {
  if (stores.length === 0) {
    return <EmptyRestaurantsState />
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {stores.map((store) => (
        <RestaurantCard key={store.id} store={store} />
      ))}
    </div>
  )
}
