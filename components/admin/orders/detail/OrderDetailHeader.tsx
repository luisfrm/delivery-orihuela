"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

interface OrderDetailHeaderProps {
  orderNumber: number
  /** Texto del subtítulo (ej: "Hace 5 min", fecha formateada). */
  subtitle?: string
  /** Si se pasa, muestra un botón de refrescar que ejecuta la función. */
  onRefresh?: () => Promise<void> | void
  className?: string
}

export function OrderDetailHeader({
  orderNumber,
  subtitle,
  onRefresh,
  className,
}: OrderDetailHeaderProps) {
  const router = useRouter()

  const handleRefresh = async () => {
    if (!onRefresh) return
    try {
      await onRefresh()
      toast.success("Pedido actualizado")
    } catch {
      toast.error("Error al actualizar el pedido")
    }
  }

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${className ?? ""}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/panel/orders")}
          aria-label="Volver a pedidos"
          className="shrink-0"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface truncate">
            Pedido #{orderNumber}
          </h1>
          {subtitle && (
            <p className="text-body-sm text-on-surface-variant truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {onRefresh && (
        <Button
          variant="secondary"
          size="default"
          onClick={handleRefresh}
          className="shrink-0"
        >
          <RefreshCw className="size-4" />
          Refrescar
        </Button>
      )}
    </div>
  )
}
