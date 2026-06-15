import Image from "next/image"
import { Utensils, UtensilsCrossed } from "lucide-react"

import type { StoreWithMetadata } from "@/lib/types"
import { getCategoryNames } from "@/lib/restaurants/categories"
import { Button } from "@/components/ui/button"

interface RestaurantCardProps {
  store: StoreWithMetadata
}

export function RestaurantCard({ store }: RestaurantCardProps) {
  const categoryNames = getCategoryNames(store.category_ids)
  const categoryLabel =
    categoryNames.length > 0 ? categoryNames.join(", ") : "Sin categoría"

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm transition-all hover:shadow-md">
      <div className="relative h-48 overflow-hidden bg-surface-container">
        {store.cover_image_url ? (
          <Image
            src={store.cover_image_url}
            alt={store.name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Utensils className="size-12 text-on-surface-variant/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 to-transparent" />

        <div className="absolute bottom-3 left-3 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-outline-variant bg-white p-1 shadow-md">
            {store.logo_url ? (
              <Image
                src={store.logo_url}
                alt={`${store.name} logo`}
                width={48}
                height={48}
                className="h-full w-full object-contain"
              />
            ) : (
              <UtensilsCrossed className="size-5 text-primary" />
            )}
          </div>
          <div className="text-white">
            <h3 className="text-title-lg font-bold leading-tight">{store.name}</h3>
            <p className="text-label-md opacity-90">{categoryLabel}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-grow flex-col gap-3 p-4">
        <div className="flex items-center justify-end text-on-surface-variant">
          <span className="rounded-full bg-surface-container-high px-3 py-1 text-label-md">
            {store.active_items_count}{" "}
            {store.active_items_count === 1 ? "producto activo" : "productos activos"}
          </span>
        </div>

        {store.description ? (
          <p className="line-clamp-2 text-body-md text-on-surface-variant">
            {store.description}
          </p>
        ) : (
          <p className="line-clamp-2 text-body-md italic text-on-surface-variant">
            Sin descripción disponible.
          </p>
        )}

        <Button
          type="button"
          variant="tertiary"
          size="default"
          className="mt-auto w-full border-2 border-primary text-primary hover:bg-primary hover:text-on-primary"
          disabled
        >
          Ver Menú
        </Button>
      </div>
    </article>
  )
}
