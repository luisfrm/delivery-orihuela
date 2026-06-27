"use client"

import Image from "next/image"

import {
  ResponsiveModal,
  ResponsiveModalContent,
} from "@/components/ui/responsive-modal"

interface ImageZoomModalProps {
  /** URL pública de la imagen. Cuando es null el modal está cerrado. */
  imageUrl: string | null
  /** Etiqueta mostrada como título del modal */
  label: string
  /** Callback para cerrar el modal */
  onClose: () => void
}

/**
 * Modal de zoom para imágenes. Reutilizado en el admin order
 * detail y en el client preview. Muestra la imagen completa
 * con `object-contain` para que se vea bien incluso si es más
 * grande que la pantalla.
 */
export function ImageZoomModal({
  imageUrl,
  label,
  onClose,
}: ImageZoomModalProps) {
  return (
    <ResponsiveModal
      open={imageUrl !== null}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <ResponsiveModalContent
        title={label}
        desktopMaxWidth="max-w-2xl"
        icon={null}
      >
        {imageUrl && (
          <div className="relative w-full h-[60vh] sm:h-[70vh]">
            <Image
              src={imageUrl}
              alt={label}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-contain"
              unoptimized
            />
          </div>
        )}
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
