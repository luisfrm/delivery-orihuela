"use client"

import { Package, Truck } from "lucide-react"
import {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
} from "@/components/ui/responsive-modal"
import { PickupForm } from "@/components/forms/PickupForm"
import { Button } from "@/components/ui/button"

interface PickupModalProps {
  /** Controlled open state. If provided, the modal is in controlled mode. */
  open?: boolean
  /** Notifies the parent when the modal should be opened/closed. */
  onOpenChange?: (open: boolean) => void
  /** Custom trigger element (e.g. a Button with `disabled` while auth is loading). */
  trigger?: React.ReactNode
  /** Fires when the default "Recoger" button is clicked (only used when no `trigger` is provided). */
  onTriggerClick?: () => void
}

export default function PickupModal({
  open,
  onOpenChange,
  trigger,
  onTriggerClick,
}: PickupModalProps) {
  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      {trigger !== undefined ? (
        <ResponsiveModalTrigger asChild>{trigger}</ResponsiveModalTrigger>
      ) : (
        <ResponsiveModalTrigger asChild>
          <Button
            variant="outline"
            size="xl"
            className="w-full lg:w-auto"
            onClick={onTriggerClick}
          >
            <Truck className="w-5 h-5" />
            Recoger
          </Button>
        </ResponsiveModalTrigger>
      )}

      <ResponsiveModalContent
        icon={<Package className="size-[18px]" />}
        title="Solicitar Recogida"
        subtitle="Recoge un pedido que ya tienes listo"
        desktopMaxWidth="max-w-md"
      >
        <PickupForm />
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}