"use client"

import { useState, useId } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Phone,
  Store as StoreIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ImageUpload } from "@/components/ui/image-upload"
import { useObjectURL } from "@/hooks/useObjectURL"
import {
  RESTAURANT_CATEGORIES,
  getCategoryNames,
} from "@/lib/restaurants/categories"
import {
  validateMaxLength,
  validateMinLength,
  validatePhone,
  validateRequired,
} from "@/lib/validation"

type Step = "info" | "media" | "preview" | "success"

interface FormData {
  name: string
  address: string
  phone: string
  description: string
  coverFile: File | null
  logoFile: File | null
  categoryIds: string[]
}

type ErrorMap = Partial<Record<keyof FormData | "categories", string>>

const STEP_TITLES: Record<Step, { title: string; subtitle: string }> = {
  info: { title: "Información", subtitle: "Datos básicos del restaurante" },
  media: { title: "Multimedia", subtitle: "Imágenes y categorías" },
  preview: { title: "Vista previa", subtitle: "Confirma los datos" },
  success: { title: "Listo", subtitle: "Restaurante creado" },
}

const STEP_ORDER: Step[] = ["info", "media", "preview", "success"]

interface AddRestaurantFormProps {
  onClose: () => void
}

const MAX_NAME = 60
const MAX_ADDRESS = 200
const MAX_DESCRIPTION = 500

export function AddRestaurantForm({ onClose }: AddRestaurantFormProps) {
  const router = useRouter()
  const categoriesHintId = useId()

  const [step, setStep] = useState<Step>("info")
  const [formData, setFormData] = useState<FormData>({
    name: "",
    address: "",
    phone: "",
    description: "",
    coverFile: null,
    logoFile: null,
    categoryIds: [],
  })
  const [errors, setErrors] = useState<ErrorMap>({})
  const [generalError, setGeneralError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const stepIndex = STEP_ORDER.indexOf(step)
  const totalSteps = 3 // info, media, preview

  const updateField = <K extends keyof FormData>(name: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateInfoStep = (): boolean => {
    const newErrors: ErrorMap = {
      name: validateMinLength(formData.name, 2, "El nombre") ||
            validateMaxLength(formData.name, MAX_NAME, "El nombre"),
      address: validateRequired(formData.address, "La dirección") ||
               validateMaxLength(formData.address, MAX_ADDRESS, "La dirección"),
      phone: validatePhone(formData.phone),
    }
    if (formData.description.trim()) {
      newErrors.description = validateMaxLength(
        formData.description,
        MAX_DESCRIPTION,
        "La descripción"
      )
    }
    setErrors(newErrors)
    return !Object.values(newErrors).some((e) => e)
  }

  const validateMediaStep = (): boolean => {
    const newErrors: ErrorMap = {}
    if (formData.categoryIds.length === 0) {
      newErrors.categories = "Selecciona al menos una categoría."
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    setGeneralError("")
    if (step === "info") {
      if (!validateInfoStep()) return
      setStep("media")
    } else if (step === "media") {
      if (!validateMediaStep()) return
      setStep("preview")
    }
  }

  const handleBack = () => {
    setGeneralError("")
    if (step === "media") setStep("info")
    else if (step === "preview") setStep("media")
  }

  const toggleCategory = (id: string) => {
    setFormData((prev) => {
      const isSelected = prev.categoryIds.includes(id)
      const next = isSelected
        ? prev.categoryIds.filter((c) => c !== id)
        : [...prev.categoryIds, id]
      return { ...prev, categoryIds: next }
    })
    if (errors.categories) {
      setErrors((prev) => ({ ...prev, categories: undefined }))
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      address: "",
      phone: "",
      description: "",
      coverFile: null,
      logoFile: null,
      categoryIds: [],
    })
    setErrors({})
    setGeneralError("")
    setStep("info")
  }

  const handleSubmit = async () => {
    setGeneralError("")
    setIsSubmitting(true)

    const toastId = toast.loading("Creando restaurante...")

    try {
      const { createStore } = await import("@/lib/actions/stores")
      const result = await createStore({
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        description: formData.description.trim() || null,
        categoryIds: formData.categoryIds,
        coverFile: formData.coverFile,
        logoFile: formData.logoFile,
      })

      if (result.error) {
        toast.error(result.error, { id: toastId })
        setGeneralError(result.error)
        setIsSubmitting(false)
        return
      }

      toast.success("Restaurante creado exitosamente", { id: toastId })
      router.refresh()
      setStep("success")
    } catch {
      toast.error("Ocurrió un error inesperado", { id: toastId })
      setGeneralError("Ocurrió un error inesperado. Intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ─── SUCCESS ──────────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40">
          <CheckCircle2 className="size-8 text-green-700 dark:text-green-300" />
        </div>
        <div className="space-y-1">
          <h2 className="text-headline-md font-bold text-on-surface">
            ¡Restaurante creado!
          </h2>
          <p className="text-body-md text-on-surface-variant">
            Ya puedes gestionarlo desde la lista de restaurantes.
          </p>
        </div>
        <div className="mt-2 flex w-full flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            type="button"
            variant="primary"
            size="default"
            onClick={resetForm}
            className="w-full sm:w-auto"
          >
            Crear otro
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="default"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cerrar
          </Button>
        </div>
      </div>
    )
  }

  // ─── PREVIEW ──────────────────────────────────────────────────────────
  if (step === "preview") {
    return (
      <div className="space-y-6 py-2">
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
          <h3 className="text-label-lg font-semibold text-on-surface-variant">
            Detalles
          </h3>
          <dl className="mt-3 space-y-3 text-body-md">
            <PreviewItem icon={<StoreIcon className="size-4" />} label="Nombre" value={formData.name} />
            <PreviewItem
              icon={<MapPin className="size-4" />}
              label="Dirección"
              value={formData.address}
            />
            <PreviewItem
              icon={<Phone className="size-4" />}
              label="Teléfono"
              value={formData.phone}
            />
            {formData.description.trim() && (
              <div>
                <dt className="text-label-md text-on-surface-variant">Descripción</dt>
                <dd className="mt-1 text-on-surface">{formData.description}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
          <h3 className="text-label-lg font-semibold text-on-surface-variant">
            Imágenes
          </h3>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <PreviewImage
              label="Portada"
              file={formData.coverFile}
              aspectClass="aspect-[16/9]"
            />
            <PreviewImage
              label="Logo"
              file={formData.logoFile}
              aspectClass="aspect-square"
            />
          </div>
        </div>

        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4">
          <h3 className="text-label-lg font-semibold text-on-surface-variant">
            Categorías
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {getCategoryNames(formData.categoryIds).map((name) => (
              <Badge key={name} variant="default">
                {name}
              </Badge>
            ))}
          </div>
        </div>

        {generalError && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {generalError}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="ghost"
            size="default"
            onClick={handleBack}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="size-4" />
            Atrás
          </Button>
          <Button
            type="button"
            variant="primary"
            size="default"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "Creando..." : "Crear restaurante"}
          </Button>
        </div>
      </div>
    )
  }

  // ─── FORM STEPS (info / media) ───────────────────────────────────────
  return (
    <div className="space-y-6 py-2">
      {/* Step indicator */}
      <div
        className="flex items-center gap-2"
        role="status"
        aria-live="polite"
      >
        <span className="text-label-md font-semibold text-primary">
          Paso {stepIndex + 1} de {totalSteps}
        </span>
        <span className="text-label-md text-on-surface-variant">
          · {STEP_TITLES[step].title}
        </span>
      </div>

      {generalError && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {generalError}
        </div>
      )}

      {step === "info" && (
        <div className="space-y-4">
          <FormField
            label="Nombre del restaurante"
            name="name"
            placeholder="Ej. La Cantina Central"
            value={formData.name}
            onChange={(v) => updateField("name", v)}
            error={errors.name}
            maxLength={MAX_NAME}
            icon={<StoreIcon className="size-4" />}
          />
          <FormField
            label="Dirección"
            name="address"
            placeholder="Ej. Av. Principal 123, Orihuela"
            value={formData.address}
            onChange={(v) => updateField("address", v)}
            error={errors.address}
            maxLength={MAX_ADDRESS}
            icon={<MapPin className="size-4" />}
          />
          <FormField
            label="Teléfono"
            name="phone"
            type="tel"
            placeholder="Ej. +34 600 000 000"
            value={formData.phone}
            onChange={(v) => updateField("phone", v)}
            error={errors.phone}
            icon={<Phone className="size-4" />}
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
              placeholder="Cuenta brevemente sobre el restaurante..."
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              maxLength={MAX_DESCRIPTION}
              rows={3}
            />
            <div className="flex items-center justify-between pl-1">
              {errors.description ? (
                <p className="text-label-md text-destructive">
                  {errors.description}
                </p>
              ) : (
                <span />
              )}
              <span className="text-label-md text-on-surface-variant">
                {formData.description.length}/{MAX_DESCRIPTION}
              </span>
            </div>
          </div>
        </div>
      )}

      {step === "media" && (
        <div className="space-y-4">
          <ImageUpload
            label="Imagen de portada"
            name="cover"
            value={formData.coverFile}
            onChange={(file) => updateField("coverFile", file)}
            aspectRatio="cover"
            helperText="Aparece como banner superior en la card."
          />
          <ImageUpload
            label="Logo"
            name="logo"
            value={formData.logoFile}
            onChange={(file) => updateField("logoFile", file)}
            aspectRatio="square"
            helperText="Aparece superpuesto en la esquina inferior izquierda."
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span
                id={categoriesHintId}
                className="text-label-lg text-on-surface font-medium pl-1"
              >
                Categorías
              </span>
              <span className="text-label-md text-on-surface-variant">
                {formData.categoryIds.length} seleccionada
                {formData.categoryIds.length === 1 ? "" : "s"}
              </span>
            </div>
            <div
              role="group"
              aria-labelledby={categoriesHintId}
              aria-describedby={
                errors.categories ? `${categoriesHintId}-error` : undefined
              }
              className="flex flex-wrap gap-2"
            >
              {RESTAURANT_CATEGORIES.map((cat) => {
                const isSelected = formData.categoryIds.includes(cat.id)
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    aria-pressed={isSelected}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
                  >
                    <Badge
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer select-none px-3 py-1.5 text-sm"
                    >
                      {cat.name}
                    </Badge>
                  </button>
                )
              })}
            </div>
            {errors.categories && (
              <p
                id={`${categoriesHintId}-error`}
                role="alert"
                className="text-label-md text-destructive pl-1"
              >
                {errors.categories}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
        {step === "info" ? (
          <div />
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="default"
            onClick={handleBack}
            disabled={isSubmitting}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="size-4" />
            Atrás
          </Button>
        )}
        <Button
          type="button"
          variant="primary"
          size="default"
          onClick={handleNext}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          Siguiente
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

interface PreviewItemProps {
  icon: React.ReactNode
  label: string
  value: string
}

function PreviewItem({ icon, label, value }: PreviewItemProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <dt className="text-label-md text-on-surface-variant">{label}</dt>
        <dd className="text-on-surface break-words">{value}</dd>
      </div>
    </div>
  )
}

interface PreviewImageProps {
  label: string
  file: File | null
  aspectClass: string
}

function PreviewImage({ label, file, aspectClass }: PreviewImageProps) {
  const url = useObjectURL(file)

  if (!file) {
    return (
      <div>
        <p className="text-label-md text-on-surface-variant mb-1.5">{label}</p>
        <div className="flex items-center justify-center rounded-lg border border-dashed border-outline-variant bg-surface-container-low text-on-surface-variant aspect-video">
          <span className="text-label-md">Sin imagen</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="text-label-md text-on-surface-variant mb-1.5">{label}</p>
      <div className={`relative max-h-32 overflow-hidden rounded-lg border border-outline-variant ${aspectClass}`}>
        {url && (
          <Image
            src={url}
            alt={label}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            className="object-cover"
            unoptimized
          />
        )}
      </div>
    </div>
  )
}
