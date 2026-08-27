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
import {
  createProductAction,
  deleteProductImageAction,
  updateProductAction,
  uploadProductImageAction,
} from "@/lib/actions/products"
import type { Product } from "@/lib/types"

interface ProductFormModalProps {
  storeId: string
  product: Product | null
  categorySlug: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (product: Product) => void
  onRequestDelete?: () => void
  trigger?: React.ReactNode
}

export function ProductFormModal({
  storeId,
  product,
  categorySlug,
  open,
  onOpenChange,
  onSave,
  onRequestDelete,
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
          storeId={storeId}
          initialName={initialName}
          initialDescription={initialDescription}
          initialPrice={initialPrice}
          initialPictureUrl={initialPictureUrl}
          isEditing={isEditing}
          categorySlug={categorySlug}
          productId={product?.id}
          existingIsActive={product?.is_active ?? true}
          onClose={() => onOpenChange(false)}
          onSave={onSave}
          onRequestDelete={onRequestDelete}
        />
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}

interface ProductFormBodyProps {
  storeId: string
  initialName: string
  initialDescription: string
  initialPrice: string
  initialPictureUrl: string | null
  isEditing: boolean
  categorySlug: string
  productId?: string
  existingIsActive: boolean
  onClose: () => void
  onSave: (product: Product) => void
  onRequestDelete?: () => void
}

function ProductFormBody({
  storeId,
  initialName,
  initialDescription,
  initialPrice,
  initialPictureUrl,
  isEditing,
  categorySlug,
  productId,
  existingIsActive,
  onClose,
  onSave,
  onRequestDelete,
}: ProductFormBodyProps) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState(initialDescription)
  const [priceInput, setPriceInput] = useState(initialPrice)
  const [pictureFile, setPictureFile] = useState<File | null>(null)
  const [existingPictureUrl, setExistingPictureUrl] = useState(initialPictureUrl)
  const [shouldRemoveImage, setShouldRemoveImage] = useState(false)
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
      const finalProductId = productId ?? crypto.randomUUID()

      let pictureUrl: string | null = shouldRemoveImage ? null : existingPictureUrl
      if (pictureFile) {
        const { url, error } = await uploadProductImageAction(
          storeId,
          finalProductId,
          pictureFile
        )
        if (error || !url) {
          setGeneralError(error ?? "Error al subir la imagen.")
          setIsSaving(false)
          return
        }
        pictureUrl = url
      }

      const trimmedDescription = description.trim() || null
      const trimmedName = name.trim()

      let result: { product?: Product; error?: string }
      if (isEditing && productId) {
        result = await updateProductAction(productId, {
          name: trimmedName,
          description: trimmedDescription,
          pictureUrl,
          estimatedPrice: cents,
          isActive: existingIsActive,
        })
        // Storage cleanup: if picture changed or explicitly removed, delete old file
        if (!result.error && initialPictureUrl && pictureUrl !== initialPictureUrl) {
          await deleteProductImageAction(initialPictureUrl)
        }
      } else {
        result = await createProductAction({
          id: finalProductId,
          storeId,
          name: trimmedName,
          description: trimmedDescription,
          pictureUrl,
          estimatedPrice: cents,
          isActive: existingIsActive,
          menuCategory: categorySlug,
        })
      }

      if (result.error || !result.product) {
        setGeneralError(result.error ?? "Error al guardar el plato.")
        setIsSaving(false)
        return
      }

      onSave(result.product)
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
        onChange={(file) => {
          setPictureFile(file)
          if (file) setShouldRemoveImage(false)
        }}
        existingUrl={shouldRemoveImage ? null : existingPictureUrl}
        onRemoveExisting={() => {
          setShouldRemoveImage(true)
          setExistingPictureUrl(null)
          setPictureFile(null)
        }}
        aspectRatio="video"
        helperText={
          shouldRemoveImage
            ? "Imagen eliminada — se guardará sin foto."
            : "Opcional. Aparecerá como thumbnail del plato."
        }
      />

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
        {isEditing && onRequestDelete ? (
          <Button
            type="button"
            variant="ghost"
            size="default"
            onClick={() => {
              onRequestDelete()
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
