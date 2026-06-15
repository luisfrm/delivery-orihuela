"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react"
import { isSortable } from "@dnd-kit/react/sortable"
import { move } from "@dnd-kit/helpers"
import { toast } from "sonner"

import type { Product, Store } from "@/lib/types"
import { MenuHeader } from "./MenuHeader"
import { MenuCategoryFilter } from "./MenuCategoryFilter"
import { MenuCategorySection } from "./MenuCategorySection"
import { MenuFooter } from "./MenuFooter"
import { ProductFormModal } from "./ProductFormModal"

interface MenuEditorProps {
  initialStore: Store
  initialProducts: Product[]
  initialCategoryOrder: string[]
}

export function MenuEditor({
  initialStore,
  initialProducts,
  initialCategoryOrder,
}: MenuEditorProps) {
  const router = useRouter()
  const [products, setProducts] = useState(() => initialProducts.map((p) => ({ ...p })))
  const [categoryOrder, setCategoryOrder] = useState(() => [...initialCategoryOrder])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const [isDirty, setIsDirty] = useState(false)
  const [deletedProductIds, setDeletedProductIds] = useState<string[]>([])

  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [modalCategory, setModalCategory] = useState<string>("")

  const sectionRefs = useRef<Map<string, HTMLElement | null>>(new Map())
  const registerSectionRef = useCallback(
    (slug: string, el: HTMLElement | null) => {
      if (el) {
        sectionRefs.current.set(slug, el)
      } else {
        sectionRefs.current.delete(slug)
      }
    },
    []
  )

  const markDirty = useCallback(() => setIsDirty(true), [])

  useEffect(() => {
    setSelectedCategory((current) => {
      if (current === null) return current
      if (sectionRefs.current.has(current)) return current
      return null
    })
  }, [categoryOrder])

  const productsByCategory = useMemo(() => {
    const map = new Map<string, Product[]>()
    for (const slug of categoryOrder) {
      map.set(slug, [])
    }
    for (const product of products) {
      if (!product.menu_category) continue
      const list = map.get(product.menu_category)
      if (list) list.push(product)
    }
    return map
  }, [products, categoryOrder])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      if (event.canceled) return
      const { source } = event.operation
      if (!source || !isSortable(source)) return

      if (source.group === undefined) {
        setCategoryOrder((prev) => {
          const next = move(prev, event)
          if (arraysEqual(prev, next)) return prev
          markDirty()
          return next
        })
        return
      }

      const category = String(source.group)
      setProducts((prev) => {
        const inCategory = prev
          .filter((p) => p.menu_category === category)
          .sort((a, b) => a.position - b.position)
        const notInCategory = prev.filter((p) => p.menu_category !== category)
        const newInCategory = move(inCategory, event).map((p, idx) => ({
          ...p,
          position: idx,
        }))
        if (
          inCategory.length === newInCategory.length &&
          inCategory.every((p, i) => p.id === newInCategory[i].id)
        ) {
          return prev
        }
        markDirty()
        return [...notInCategory, ...newInCategory]
      })
    },
    [markDirty]
  )

  const handleSelectCategory = useCallback(
    (slug: string | null) => {
      if (slug === null) {
        setSelectedCategory(null)
        return
      }
      setSelectedCategory(slug)
      const el = sectionRefs.current.get(slug)
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    },
    []
  )

  const handleAddProduct = useCallback((slug: string) => {
    setEditingProduct(null)
    setModalCategory(slug)
    setModalOpen(true)
  }, [])

  const handleEditProduct = useCallback((product: Product) => {
    setEditingProduct(product)
    setModalCategory(product.menu_category ?? "")
    setModalOpen(true)
  }, [])

  const handleDeleteProduct = useCallback(
    (productId: string) => {
      setProducts((prev) => prev.filter((p) => p.id !== productId))
      if (!productId.startsWith("tmp_")) {
        setDeletedProductIds((prev) => [...prev, productId])
      }
      markDirty()
      toast.success("Plato eliminado")
    },
    [markDirty]
  )

  const handleSaveProduct = useCallback(
    (product: Product) => {
      setProducts((prev) => {
        const existingIndex = prev.findIndex((p) => p.id === product.id)
        if (existingIndex >= 0) {
          const next = [...prev]
          next[existingIndex] = product
          return next
        }

        const inCategory = prev.filter(
          (p) => p.menu_category === product.menu_category
        )
        const newPosition = inCategory.length
        return [
          ...prev,
          { ...product, position: newPosition },
        ]
      })
      markDirty()
      toast.success(
        product.id.startsWith("tmp_") ? "Plato añadido" : "Plato actualizado"
      )
    },
    [markDirty]
  )

  const handleDiscard = useCallback(() => {
    setProducts(initialProducts.map((p) => ({ ...p })))
    setCategoryOrder([...initialCategoryOrder])
    setDeletedProductIds([])
    setIsDirty(false)
    toast.info("Cambios descartados")
  }, [initialProducts, initialCategoryOrder])

  const [isSaving, setIsSaving] = useState(false)
  const handleSave = useCallback(async () => {
    setIsSaving(true)
    const saveToast = toast.loading("Guardando menú...")
    try {
      const { saveMenu } = await import("@/lib/actions/stores")
      const result = await saveMenu(initialStore.id, {
        categoryOrder,
        products,
        deletedProductIds,
      })

      if (result.error) {
        toast.error(result.error, { id: saveToast })
        setIsSaving(false)
        return
      }

      toast.success("Menú guardado", { id: saveToast })
      setIsDirty(false)
      setDeletedProductIds([])
      router.refresh()
    } catch {
      toast.error("Error al guardar el menú", { id: saveToast })
    } finally {
      setIsSaving(false)
    }
  }, [initialStore.id, categoryOrder, products, deletedProductIds, router])

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-4 px-4 sm:px-6 lg:px-8 py-4 border-b border-outline-variant bg-surface-container-lowest">
        <MenuHeader store={initialStore} />
        <div className="pt-1">
          <MenuCategoryFilter
            selectedCategory={selectedCategory}
            onSelect={handleSelectCategory}
          />
        </div>
      </div>

      <DragDropProvider onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="mx-auto max-w-3xl space-y-6 pb-6">
            {categoryOrder.map((slug, index) => {
              const productsInCategory = productsByCategory.get(slug) ?? []
              return (
                <MenuCategorySection
                  key={slug}
                  slug={slug}
                  index={index}
                  products={productsInCategory}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  onAddProduct={handleAddProduct}
                  onEditProduct={handleEditProduct}
                  onDeleteProduct={handleDeleteProduct}
                  registerSectionRef={registerSectionRef}
                />
              )
            })}

            {categoryOrder.length === 0 && (
              <div className="rounded-xl border border-dashed border-outline-variant p-8 text-center text-on-surface-variant">
                No hay categorías disponibles.
              </div>
            )}
          </div>
        </div>
      </DragDropProvider>

      <ProductFormModal
        key={editingProduct?.id ?? "new"}
        product={editingProduct}
        categorySlug={modalCategory}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSaveProduct}
        onDelete={editingProduct ? handleDeleteProduct : undefined}
      />

      <MenuFooter
        lastUpdated={initialStore.updated_at ?? null}
        isDirty={isDirty}
        isSaving={isSaving}
        onDiscard={handleDiscard}
        onSave={handleSave}
      />
    </div>
  )
}

function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false
  }
  return true
}
