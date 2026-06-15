"use client"

import { RotateCcw, Save } from "lucide-react"

import { Button } from "@/components/ui/button"

interface MenuFooterProps {
  lastUpdated: string | null
  isDirty: boolean
  isSaving: boolean
  onDiscard: () => void
  onSave: () => void
}

function formatRelativeDate(iso: string | null): string {
  if (!iso) return "Nunca"
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return "Justo ahora"
  if (diffMin < 60) return `Hace ${diffMin} min`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `Hace ${diffH} h`
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function MenuFooter({
  lastUpdated,
  isDirty,
  isSaving,
  onDiscard,
  onSave,
}: MenuFooterProps) {
  return (
    <div className="sticky bottom-0 z-30 -mx-4 sm:-mx-6 lg:-mx-8 border-t border-outline-variant bg-surface-container-lowest/95 backdrop-blur-sm px-4 sm:px-6 lg:px-8 py-3">
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-label-md text-on-surface-variant">
          <span className="font-semibold">Última actualización:</span>{" "}
          {formatRelativeDate(lastUpdated)}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="default"
            onClick={onDiscard}
            disabled={!isDirty || isSaving}
          >
            <RotateCcw className="size-4" />
            Descartar cambios
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="default"
            onClick={onSave}
            disabled={!isDirty || isSaving}
          >
            <Save className="size-4" />
            {isSaving ? "Guardando..." : "Guardar menú"}
          </Button>
        </div>
      </div>
    </div>
  )
}
