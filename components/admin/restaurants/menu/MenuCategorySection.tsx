"use client"

import { GripVertical, Trash2 } from "lucide-react"
import { useSortable } from "@dnd-kit/react/sortable"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { getCategoryById } from "@/lib/restaurants/menu-categories"
import type { Product } from "@/lib/types"
import { ProductCard } from "./ProductCard"
import { AddProductCard } from "./AddProductCard"

interface MenuCategorySectionProps {
  slug: string
  index: number
  products: Product[]
  selectedCategory: string | null
  onSelectCategory: (slug: string | null) => void
  onAddProduct: (slug: string) => void
  onEditProduct: (product: Product) => void
  onDeleteProduct: (productId: string) => void
  registerSectionRef: (slug: string, element: HTMLElement | null) => void
}

export function MenuCategorySection({
  slug,
  index,
  products,
  selectedCategory,
  onSelectCategory,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  registerSectionRef,
}: MenuCategorySectionProps) {
  const category = getCategoryById(slug)

  const { ref, handleRef, isDragging } = useSortable({
    id: slug,
    index,
  })

  const isVisible = selectedCategory === null || selectedCategory === slug

  if (!isVisible) return null

  return (
    <section
      ref={(el) => {
        ref(el)
        registerSectionRef(slug, el)
      }}
      data-category-section={slug}
      className={cn(
        "space-y-3 rounded-xl transition-opacity",
        isDragging && "opacity-40"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div
          ref={handleRef}
          className="group/handle flex min-w-0 items-center gap-2 cursor-grab-custom touch-none select-none rounded-md -ml-1 pl-1 pr-2 transition-colors hover:bg-surface-container-low active:cursor-grabbing-custom"
        >
          <GripVertical
            aria-hidden="true"
            className="size-4 shrink-0 text-on-surface-variant/60 transition-colors group-hover/handle:text-on-surface-variant"
          />
          {category && (
            <category.icon className="size-5 shrink-0 text-primary" />
          )}
          <h2 className="text-title-lg font-bold text-on-surface truncate">
            {category?.name ?? slug}
          </h2>
          <span className="text-label-md text-on-surface-variant shrink-0">
            ({products.length} {products.length === 1 ? "plato" : "platos"})
          </span>
        </div>
        <button
          type="button"
          onClick={() => onSelectCategory(slug)}
          className="text-label-md text-on-surface-variant hover:text-primary transition-colors"
          aria-label="Filtrar por esta categoría"
        >
          Filtrar
        </button>
      </div>

      <div className="space-y-2">
        {products.map((product, pIndex) => (
          <SortableProductRow
            key={product.id}
            product={product}
            index={pIndex}
            categorySlug={slug}
            onEdit={() => onEditProduct(product)}
            onDelete={() => onDeleteProduct(product.id)}
          />
        ))}
        <AddProductCard categorySlug={slug} onClick={() => onAddProduct(slug)} />
      </div>
    </section>
  )
}

interface SortableProductRowProps {
  product: Product
  index: number
  categorySlug: string
  onEdit: () => void
  onDelete: () => void
}

function SortableProductRow({
  product,
  index,
  categorySlug,
  onEdit,
  onDelete,
}: SortableProductRowProps) {
  const { ref, isDragging } = useSortable({
    id: product.id,
    index,
    group: categorySlug,
    type: "product",
    accept: "product",
  })

  return (
    <div className="group/row relative">
      <ProductCard
        product={product}
        onClick={onEdit}
        dragHandleRef={ref}
        isDragging={isDragging}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onDelete}
        aria-label="Eliminar plato"
        className="absolute right-2 top-2 opacity-0 group-hover/row:opacity-100 focus:opacity-100 transition-opacity text-on-surface-variant hover:text-error"
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  )
}
