"use client"

import { useState, type ReactNode } from "react"
import { Plus, Utensils } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalTrigger,
} from "@/components/ui/responsive-modal"
import { StoreForm } from "@/components/forms/StoreForm"
import type { StoreWithMetadata } from "@/lib/types"

interface StoreFormModalProps {
  mode: "create" | "edit"
  store?: StoreWithMetadata
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSaved?: (store: StoreWithMetadata, newSlug?: string) => void
}

export function StoreFormModal({
  mode,
  store,
  trigger,
  open,
  onOpenChange,
  onSaved,
}: StoreFormModalProps) {
  const isControlled = open !== undefined
  const [internalOpen, setInternalOpen] = useState(false)

  const actualOpen = isControlled ? open : internalOpen

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) setInternalOpen(nextOpen)
    onOpenChange?.(nextOpen)
  }

  const isEditing = mode === "edit"

  return (
    <ResponsiveModal open={actualOpen} onOpenChange={handleOpenChange}>
      <ResponsiveModalTrigger asChild>
        {trigger ??
          (isEditing ? (
            <span />
          ) : (
            <Button type="button" variant="secondary" size="default">
              <Plus className="size-4" />
              Agregar Restaurante
            </Button>
          ))}
      </ResponsiveModalTrigger>

      <ResponsiveModalContent
        icon={<Utensils className="size-[18px]" />}
        title={isEditing ? "Editar restaurante" : "Nuevo restaurante"}
        subtitle={
          isEditing
            ? "Modifica la información del aliado comercial"
            : "Registra un nuevo aliado comercial"
        }
        desktopMaxWidth="max-w-2xl"
      >
        <StoreForm
          key={isEditing ? store?.id ?? "edit" : "create"}
          mode={mode}
          store={store}
          onClose={() => handleOpenChange(false)}
          onSaved={onSaved}
        />
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
