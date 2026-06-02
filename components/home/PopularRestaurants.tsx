import { Store, Pizza, Hamburger, User } from "lucide-react"

interface Restaurant {
  id: string
  name: string
  category: string
  rating: string
  icon: React.ReactNode
}

const restaurants: Restaurant[] = [
  { id: "1", name: "La Parrilla del Tío", category: "Carnes y Asados", rating: "4.8 ★", icon: <Store className="w-8 h-8" /> },
  { id: "2", name: "Pizzería Napoli", category: "Pizzas y Pastas", rating: "4.6 ★", icon: <Pizza className="w-8 h-8" /> },
  { id: "3", name: "Burger Kingo", category: "Hamburguesas", rating: "4.5 ★", icon: <Hamburger className="w-8 h-8" /> },
]

interface PopularRestaurantsProps {
  onRestaurantClick?: (id: string) => void
}

export function PopularRestaurants({ onRestaurantClick }: PopularRestaurantsProps) {
  return (
    <section className="px-[20px] flex flex-col gap-[12px]">
      <h3 className="text-headline-md text-on-surface">Restaurantes Populares</h3>
      <div className="flex flex-col lg:flex-row gap-[12px]">
        {restaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            onClick={() => onRestaurantClick?.(restaurant.id)}
            className="flex flex-row gap-[12px] items-center bg-surface-container-lowest p-[12px] rounded-xl border border-outline-variant shadow-sm cursor-pointer active:scale-[0.98] hover:scale-[1.05] hover:border-secondary transition-all duration-300 ease-in-out"
          >
            <div className="w-16 h-16 rounded-lg bg-surface-container flex-shrink-0 flex items-center justify-center text-primary">
              {restaurant.icon}
            </div>
            <div className="flex flex-col flex-grow">
              <h4 className="text-title-lg font-bold text-on-surface">{restaurant.name}</h4>
              <p className="text-body-md text-on-surface-variant">{restaurant.category} • <span className="text-secondary">{restaurant.rating}</span></p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}