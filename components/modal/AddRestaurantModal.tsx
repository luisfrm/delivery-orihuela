"use client"

import { useState, type ReactNode } from "react"
import { Plus, Utensils } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalTrigger,
} from "@/components/ui/responsive-modal"
import { AddRestaurantForm } from "@/components/forms/AddRestaurantForm"

interface AddRestaurantModalProps {
  trigger?: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function AddRestaurantModal({
  trigger,
  open,
  onOpenChange,
}: AddRestaurantModalProps) {
  const isControlled = open !== undefined
  const [internalOpen, setInternalOpen] = useState(false)

  const actualOpen = isControlled ? open : internalOpen

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) setInternalOpen(nextOpen)
    onOpenChange?.(nextOpen)
  }

  return (
    <ResponsiveModal open={actualOpen} onOpenChange={handleOpenChange}>
      <ResponsiveModalTrigger asChild>
        {trigger ?? (
          <Button type="button" variant="secondary" size="default">
            <Plus className="size-4" />
            Agregar Restaurante
          </Button>
        )}
      </ResponsiveModalTrigger>

      <ResponsiveModalContent
        icon={<Utensils className="size-[18px]" />}
        title="Nuevo restaurante"
        subtitle="Registra un nuevo aliado comercial"
        desktopMaxWidth="max-w-2xl"
      >
        <AddRestaurantForm onClose={() => handleOpenChange(false)} />
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
