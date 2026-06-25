import { Check } from "lucide-react"

import { OrderStatusBadge } from "@/components/admin/orders/OrderStatusBadge"
import { ORDER_STATUS_CONFIG } from "@/lib/orders/order-status"
import { formatOrderDate, formatOrderTimeOnly } from "@/lib/orders/format"
import type { OrderStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

interface OrderStatusBannerProps {
  status: OrderStatus
  createdAt: string
  className?: string
}

const PROGRESS_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "pending", label: "Pendiente" },
  { status: "assigned", label: "Asignado" },
  { status: "on_the_way", label: "En camino" },
  { status: "at_customer", label: "En destino" },
]

function getActiveStepIndex(status: OrderStatus): number {
  if (status === "cancelled") return -1
  return PROGRESS_STEPS.findIndex((s) => s.status === status)
}

export function OrderStatusBanner({
  status,
  createdAt,
  className,
}: OrderStatusBannerProps) {
  const config = ORDER_STATUS_CONFIG[status]
  const StatusIcon = config.icon
  const activeIndex = getActiveStepIndex(status)
  const isDelivered = status === "delivered"
  const isCancelled = status === "cancelled"

  return (
    <div
      className={cn(
        "rounded-xl border border-outline-variant bg-surface-container-lowest p-4 sm:p-5",
        className
      )}
    >
      {/* Header con "ESTADO ACTUAL" + badge + fecha: solo en estados activos.
          En terminales, el bloque grande (icono + título + subtítulo) ya
          comunica el estado, así que este header sería redundante. */}
      {!isDelivered && !isCancelled && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
              Estado actual
            </span>
            <OrderStatusBadge status={status} />
          </div>
          <div className="flex items-center gap-2 text-label-md text-on-surface-variant">
            <span>{formatOrderDate(createdAt)}</span>
            <span aria-hidden="true">·</span>
            <span>{formatOrderTimeOnly(createdAt)}</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-12 h-12 shrink-0 rounded-full flex items-center justify-center shadow-sm border",
            status === "pending" || status === "assigned"
              ? "bg-warning/10 text-warning border-warning/20"
              : status === "on_the_way" || status === "at_customer"
                ? "bg-info/10 text-info border-info/20"
                : isDelivered
                  ? "bg-success/10 text-success border-success/20"
                  : "bg-destructive/10 text-destructive border-destructive/20"
          )}
        >
          <StatusIcon className="size-6" />
        </div>
        <div>
          <h2 className={cn(
            "text-headline-md font-bold text-on-surface",
          )}>
            {config.label}
          </h2>
          <p className="text-body-sm text-on-surface-variant">
            {isDelivered
              ? `Pedido entregado al cliente · ${formatOrderDate(createdAt)}`
              : isCancelled
                ? `Pedido cancelado · ${formatOrderDate(createdAt)}`
                : `Paso ${Math.max(activeIndex + 1, 1)} de ${PROGRESS_STEPS.length}`}
          </p>
        </div>
      </div>

      {/* 4-step progress bar */}
      {!isCancelled && !isDelivered && (
        <div className="mt-4 grid grid-cols-4 gap-1.5">
          {PROGRESS_STEPS.map((step, index) => {
            const isCompleted = index < activeIndex
            const isActive = index === activeIndex
            return (
              <div
                key={step.status}
                className={cn(
                  "h-2 rounded-full transition-colors",
                  isCompleted
                    ? "bg-success/40"
                    : isActive
                      ? "bg-primary"
                      : "bg-surface-container-highest"
                )}
                aria-label={`${step.label}: ${isCompleted
                  ? "completado"
                  : isActive
                    ? "en curso"
                    : "pendiente"
                  }`}
              />
            )
          })}
        </div>
      )}

      {/* Step labels (visible on sm+) */}
      {!isCancelled && !isDelivered && (
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {PROGRESS_STEPS.map((step, index) => {
            const isCompleted = index < activeIndex
            const isActive = index === activeIndex
            return (
              <div
                key={`label-${step.status}`}
                className={cn(
                  "text-label-md truncate text-center",
                  isCompleted
                    ? "text-on-surface-variant/60 font-normal"
                    : isActive
                      ? "text-primary font-semibold"
                      : "text-on-surface-variant"
                )}
              >
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">
                  {isCompleted ? (
                    <Check className="size-3 mx-auto" />
                  ) : (
                    index + 1
                  )}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Sin footer extra: el título "Entregado" + subtítulo "Pedido entregado al cliente" */}
      {/* ya comunican el estado terminal cuando la barra está oculta. */}
    </div>
  )
}
