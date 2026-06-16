"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { MoreVertical, Pencil, Trash2, Utensils, UtensilsCrossed } from "lucide-react"

import type { StoreWithMetadata } from "@/lib/types"
import { getCategoryNames } from "@/lib/restaurants/categories"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StoreFormModal } from "@/components/modal/StoreFormModal"
import { DeleteRestaurantModal } from "@/components/admin/restaurants/DeleteRestaurantModal"

interface RestaurantCardProps {
  store: StoreWithMetadata
}

export function RestaurantCard({ store }: RestaurantCardProps) {
  const categoryNames = getCategoryNames(store.category_ids)
  const categoryLabel =
    categoryNames.length > 0 ? categoryNames.join(", ") : "Sin categoría"

  const [editingOpen, setEditingOpen] = useState(false)
  const [deletingOpen, setDeletingOpen] = useState(false)
  const [currentStore, setCurrentStore] = useState<StoreWithMetadata>(store)

  return (
    <article className="group/card relative flex h-full flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm transition-all hover:shadow-md">
      <div className="absolute right-2 top-2 z-10">
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Opciones del restaurante"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-on-surface shadow-sm transition-transform hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setEditingOpen(true)}>
              <Pencil className="size-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeletingOpen(true)}
            >
              <Trash2 className="size-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative h-48 overflow-hidden bg-surface-container">
        {currentStore.cover_image_url ? (
          <Image
            src={currentStore.cover_image_url}
            alt={currentStore.name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Utensils className="size-12 text-on-surface-variant/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-on-surface/60 to-transparent" />

        <div className="absolute bottom-3 left-3 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-outline-variant bg-white p-1 shadow-md">
            {currentStore.logo_url ? (
              <Image
                src={currentStore.logo_url}
                alt={`${currentStore.name} logo`}
                width={48}
                height={48}
                className="h-full w-full object-contain"
              />
            ) : (
              <UtensilsCrossed className="size-5 text-primary" />
            )}
          </div>
          <div className="text-white">
            <h3 className="text-title-lg font-bold leading-tight">{currentStore.name}</h3>
            <p className="text-label-md opacity-90">{categoryLabel}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-grow flex-col gap-3 p-4">
        <div className="flex items-center justify-end text-on-surface-variant">
          <span className="rounded-full bg-surface-container-high px-3 py-1 text-label-md">
            {currentStore.active_items_count}{" "}
            {currentStore.active_items_count === 1 ? "producto activo" : "productos activos"}
          </span>
        </div>

        {currentStore.description ? (
          <p className="line-clamp-2 text-body-md text-on-surface-variant">
            {currentStore.description}
          </p>
        ) : (
          <p className="line-clamp-2 text-body-md italic text-on-surface-variant">
            Sin descripción disponible.
          </p>
        )}

        <Link href={`/panel/restaurants/${currentStore.slug}/menu`}>
          <Button
            variant="outline_primary"
            size="default"
            className="mt-auto w-full"
          >
            Ver Menú
          </Button>
        </Link>
      </div>

      <StoreFormModal
        mode="edit"
        store={currentStore}
        open={editingOpen}
        onOpenChange={setEditingOpen}
        onSaved={(updated) => setCurrentStore(updated)}
      />
      <DeleteRestaurantModal
        store={currentStore}
        open={deletingOpen}
        onOpenChange={setDeletingOpen}
      />
    </article>
  )
}
