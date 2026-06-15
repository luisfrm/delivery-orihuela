"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Building2,
  Tag,
  ImageIcon,
  Save,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { ImageUpload } from "@/components/ui/image-upload"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { validateMaxLength, validateRequired } from "@/lib/validation"
import type { OrganizationSettings } from "@/lib/types/organization"

interface SettingsFormProps {
  initial: OrganizationSettings
}

interface FormErrors {
  name: string
  tagline: string
  logoAlt: string
  general: string
}

const EMPTY_ERRORS: FormErrors = {
  name: "",
  tagline: "",
  logoAlt: "",
  general: "",
}

const MAX_NAME = 60
const MAX_TAGLINE = 40
const MAX_LOGO_ALT = 100

function validateField(name: keyof Omit<FormErrors, "general">, value: string): string {
  switch (name) {
    case "name":
      return (
        validateRequired(value, "El nombre de la organización") ||
        validateMaxLength(value, MAX_NAME, "El nombre de la organización")
      )
    case "tagline":
      return (
        validateRequired(value, "El eslogan") ||
        validateMaxLength(value, MAX_TAGLINE, "El eslogan")
      )
    case "logoAlt":
      return (
        validateRequired(value, "El texto alternativo") ||
        validateMaxLength(value, MAX_LOGO_ALT, "El texto alternativo")
      )
    default:
      return ""
  }
}

export function SettingsForm({ initial }: SettingsFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [savedSnapshot, setSavedSnapshot] = useState<OrganizationSettings>(initial)

  const [name, setName] = useState(initial.name)
  const [tagline, setTagline] = useState(initial.tagline)
  const [logoAlt, setLogoAlt] = useState(initial.logoAlt)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [currentLogoUrl, setCurrentLogoUrl] = useState(initial.logoUrl)

  const [errors, setErrors] = useState<FormErrors>(EMPTY_ERRORS)

  const hasLogoChange = logoFile !== null
  const isDirty =
    name !== savedSnapshot.name ||
    tagline !== savedSnapshot.tagline ||
    logoAlt !== savedSnapshot.logoAlt ||
    hasLogoChange

  const handleChange = (
    field: keyof Omit<FormErrors, "general">,
    value: string
  ) => {
    if (field === "name") setName(value)
    if (field === "tagline") setTagline(value)
    if (field === "logoAlt") setLogoAlt(value)

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value), general: "" }))
    }
  }

  const handleRemoveNewLogo = () => {
    setLogoFile(null)
  }

  const handleRemoveCurrentLogo = () => {
    setCurrentLogoUrl("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: FormErrors = {
      name: validateField("name", name),
      tagline: validateField("tagline", tagline),
      logoAlt: validateField("logoAlt", logoAlt),
      general: "",
    }

    if (Object.values(newErrors).some((v) => v !== "")) {
      setErrors(newErrors)
      return
    }

    const finalLogoUrl = logoFile ? currentLogoUrl : currentLogoUrl

    const toastId = toast.loading("Guardando configuración…")

    startTransition(async () => {
      const { updateOrganizationSettingsAction } = await import(
        "@/lib/actions/organization"
      )
      const result = await updateOrganizationSettingsAction({
        name: name.trim(),
        tagline: tagline.trim(),
        logoAlt: logoAlt.trim(),
        logoFile,
        currentLogoUrl: finalLogoUrl,
      })

      if (result.error) {
        toast.error(result.error, { id: toastId })
        setErrors((prev) => ({ ...prev, general: result.error! }))
        return
      }

      if (result.settings) {
        setSavedSnapshot(result.settings)
        setName(result.settings.name)
        setTagline(result.settings.tagline)
        setLogoAlt(result.settings.logoAlt)
        setCurrentLogoUrl(result.settings.logoUrl)
        setLogoFile(null)
      }

      toast.success("Configuración guardada", { id: toastId })
      router.refresh()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <Card variant="surface">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="size-4" />
            </div>
            <div>
              <CardTitle>Identidad pública</CardTitle>
              <CardDescription>
                Se muestra en la barra superior y en el sidebar del panel.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            label="Nombre de la organización"
            name="name"
            placeholder="Ej. Orihuela Delivery"
            value={name}
            onChange={(v) => handleChange("name", v)}
            error={errors.name}
            icon={<Building2 className="size-4" />}
            maxLength={MAX_NAME}
          />
          <FormField
            label="Eslogan"
            name="tagline"
            placeholder="Ej. Delivery"
            value={tagline}
            onChange={(v) => handleChange("tagline", v)}
            error={errors.tagline}
            icon={<Tag className="size-4" />}
            maxLength={MAX_TAGLINE}
          />
        </CardContent>
      </Card>

      <Card variant="surface">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ImageIcon className="size-4" />
            </div>
            <div>
              <CardTitle>Logo público</CardTitle>
              <CardDescription>
                Aparece en la esquina superior izquierda de la app.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentLogoUrl && !hasLogoChange && (
            <div className="space-y-2">
              <span className="text-label-lg text-on-surface font-medium pl-1">
                Logo actual
              </span>
              <div className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-low p-3">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 border-outline-variant">
                  <Image
                    src={currentLogoUrl}
                    alt={logoAlt || savedSnapshot.logoAlt}
                    fill
                    sizes="64px"
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-label-lg text-on-surface truncate">
                    {savedSnapshot.logoAlt || "Logo"}
                  </p>
                  <p className="text-label-md text-on-surface-variant truncate">
                    {currentLogoUrl}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveCurrentLogo}
                >
                  Quitar
                </Button>
              </div>
            </div>
          )}

          <ImageUpload
            label={hasLogoChange ? "Nuevo logo" : currentLogoUrl ? "Reemplazar logo" : "Subir logo"}
            name="logo"
            value={logoFile}
            onChange={setLogoFile}
            aspectRatio="square"
            helperText="Recomendado: imagen cuadrada en PNG o WebP, fondo transparente."
          />

          {hasLogoChange && (
            <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-3">
              <div className="flex items-center gap-2 text-label-lg text-primary">
                <CheckCircle2 className="size-4" />
                <span>Nuevo logo listo para guardar</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveNewLogo}
              >
                Descartar
              </Button>
            </div>
          )}

          <FormField
            label="Texto alternativo del logo"
            name="logoAlt"
            placeholder="Ej. Logo de Orihuela Delivery"
            value={logoAlt}
            onChange={(v) => handleChange("logoAlt", v)}
            error={errors.logoAlt}
            icon={<ImageIcon className="size-4" />}
            maxLength={MAX_LOGO_ALT}
          />
        </CardContent>
      </Card>

      {errors.general && (
        <div className="flex items-start gap-2.5 rounded-lg bg-error-container/50 border border-error-container px-4 py-3">
          <AlertCircle className="size-4 text-error shrink-0 mt-0.5" />
          <p className="text-label-lg text-on-error-container">{errors.general}</p>
        </div>
      )}

      <div className="flex flex-col-reverse items-stretch gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-label-md text-on-surface-variant">
          <Info className="size-4" />
          Los cambios se aplican en toda la app al guardar.
        </div>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isPending || !isDirty}
          className="w-full sm:w-auto"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <span className="size-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              Guardando…
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="size-4" />
              Guardar configuración
            </span>
          )}
        </Button>
      </div>
    </form>
  )
}
