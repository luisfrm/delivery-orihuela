import { UtensilsCrossed } from "lucide-react"

export function EmptyRestaurantsState() {
  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-sm">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-container">
          <UtensilsCrossed className="size-10 text-white" />
        </div>

        <div className="space-y-2">
          <h2 className="text-headline-md font-bold text-on-surface">
            No hay restaurantes registrados
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Comienza expandiendo tu red de aliados comerciales. Registra tu primer
            restaurante para empezar a gestionar pedidos.
          </p>
        </div>
      </div>
    </div>
  )
}
