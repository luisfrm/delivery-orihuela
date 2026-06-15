"use client"

import { useState } from "react"
import { Trash2, Utensils } from "lucide-react"

import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalTrigger,
} from "@/components/ui/responsive-modal"
import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { ImageUpload } from "@/components/ui/image-upload"
import {
  formatPriceCents,
  parsePriceEurosToCents,
} from "@/lib/restaurants/menu-format"
import {
  validateMaxLength,
  validateRequired,
} from "@/lib/validation"
import type { Product } from "@/lib/types"

interface ProductFormModalProps {
  product: Product | null
  categorySlug: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (product: Product) => void
  onDelete?: (productId: string) => void
  trigger?: React.ReactNode
}

export function ProductFormModal({
  product,
  categorySlug,
  open,
  onOpenChange,
  onSave,
  onDelete,
  trigger,
}: ProductFormModalProps) {
  const isEditing = product !== null

  const initialName = product?.name ?? ""
  const initialDescription = product?.description ?? ""
  const initialPrice = product
    ? (product.estimated_price / 100).toFixed(2).replace(".", ",")
    : ""
  const initialPictureUrl = product?.picture_url ?? null

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      {trigger && <ResponsiveModalTrigger asChild>{trigger}</ResponsiveModalTrigger>}
      <ResponsiveModalContent
        icon={<Utensils className="size-[18px]" />}
        title={isEditing ? "Editar plato" : "Nuevo plato"}
        subtitle="Información del producto del menú"
        desktopMaxWidth="max-w-xl"
      >
        <ProductFormBody
          key={`${open ? "open" : "closed"}-${product?.id ?? "new"}`}
          initialName={initialName}
          initialDescription={initialDescription}
          initialPrice={initialPrice}
          initialPictureUrl={initialPictureUrl}
          isEditing={isEditing}
          categorySlug={categorySlug}
          productId={product?.id}
          existingIsActive={product?.is_active ?? true}
          existingPosition={product?.position ?? 0}
          existingStoreId={product?.store_id ?? ""}
          existingCreatedAt={product?.created_at ?? new Date().toISOString()}
          onClose={() => onOpenChange(false)}
          onSave={onSave}
          onDelete={onDelete}
        />
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}

interface ProductFormBodyProps {
  initialName: string
  initialDescription: string
  initialPrice: string
  initialPictureUrl: string | null
  isEditing: boolean
  categorySlug: string
  productId?: string
  existingIsActive: boolean
  existingPosition: number
  existingStoreId: string
  existingCreatedAt: string
  onClose: () => void
  onSave: (product: Product) => void
  onDelete?: (productId: string) => void
}

function ProductFormBody({
  initialName,
  initialDescription,
  initialPrice,
  initialPictureUrl,
  isEditing,
  categorySlug,
  productId,
  existingIsActive,
  existingPosition,
  existingStoreId,
  existingCreatedAt,
  onClose,
  onSave,
  onDelete,
}: ProductFormBodyProps) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [priceInput, setPriceInput] = useState(initialPrice)
  const [pictureFile, setPictureFile] = useState<File | null>(null)
  const [existingPictureUrl] = useState(initialPictureUrl)
  const [errors, setErrors] = useState<{ name?: string; description?: string; price?: string }>({})
  const [generalError, setGeneralError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async () => {
    setGeneralError("")

    const newErrors: typeof errors = {
      name:
        validateRequired(name, "El nombre") ||
        validateMaxLength(name, 100, "El nombre"),
      price: validateRequired(priceInput, "El precio"),
    }
    if (description) {
      newErrors.description = validateMaxLength(description, 500, "La descripción")
    }
    if (newErrors.price) {
      const cents = parsePriceEurosToCents(priceInput)
      if (Number.isNaN(cents) || cents < 0) {
        newErrors.price = "Ingresa un precio válido (ej. 1,50)."
      }
    }

    setErrors(newErrors)
    if (Object.values(newErrors).some((e) => e)) return

    const cents = parsePriceEurosToCents(priceInput)

    setIsSaving(true)
    try {
      onSave({
        id: productId ?? `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        store_id: existingStoreId,
        name: name.trim(),
        description: description.trim() || null,
        picture_url: existingPictureUrl,
        estimated_price: cents,
        is_active: existingIsActive,
        menu_category: categorySlug,
        position: existingPosition,
        created_at: existingCreatedAt,
        updated_at: new Date().toISOString(),
      })
      onClose()
    } catch {
      setGeneralError("Ocurrió un error inesperado.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4 py-2">
      {generalError && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {generalError}
        </div>
      )}

      <FormField
        label="Nombre del plato"
        name="name"
        placeholder="Ej. Croquetas de jamón"
        value={name}
        onChange={setName}
        error={errors.name}
        maxLength={100}
      />

      <div className="space-y-1.5">
        <label
          htmlFor="description"
          className="text-label-lg text-on-surface pl-1 font-medium"
        >
          Descripción
          <span className="ml-1 text-label-md text-on-surface-variant">
            (opcional)
          </span>
        </label>
        <Textarea
          id="description"
          name="description"
          placeholder="Describe brevemente el plato..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          rows={3}
        />
        {errors.description && (
          <p className="text-label-md text-destructive pl-1">
            {errors.description}
          </p>
        )}
        <p className="text-label-md text-on-surface-variant pl-1 text-right">
          {description.length}/500
        </p>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="price"
          className="text-label-lg text-on-surface pl-1 font-medium"
        >
          Precio (€)
        </label>
        <div className="relative">
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            placeholder="0,00"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            className={errors.price ? "border-destructive pr-12" : "pr-12"}
          />
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-label-md font-bold text-on-surface-variant">
            €
          </span>
        </div>
        {errors.price && (
          <p className="text-label-md text-destructive pl-1">{errors.price}</p>
        )}
        {priceInput && !errors.price && (
          <p className="text-label-md text-on-surface-variant pl-1">
            Vista previa: {formatPriceCents(parsePriceEurosToCents(priceInput) || 0)}
          </p>
        )}
      </div>

      <ImageUpload
        label="Imagen del plato"
        name="picture"
        value={pictureFile}
        onChange={setPictureFile}
        aspectRatio="video"
        helperText="Opcional. Aparecerá como thumbnail del plato."
      />

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
        {isEditing && onDelete ? (
          <Button
            type="button"
            variant="ghost"
            size="default"
            onClick={() => {
              if (productId) onDelete(productId)
              onClose()
            }}
            disabled={isSaving}
            className="w-full sm:w-auto text-error hover:bg-error-container"
          >
            <Trash2 className="size-4" />
            Eliminar
          </Button>
        ) : (
          <div />
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button
            type="button"
            variant="ghost"
            size="default"
            onClick={onClose}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            size="default"
            onClick={handleSubmit}
            disabled={isSaving}
            className="w-full sm:w-auto"
          >
            {isSaving ? "Guardando..." : isEditing ? "Guardar cambios" : "Añadir plato"}
          </Button>
        </div>
      </div>
    </div>
  )
}
