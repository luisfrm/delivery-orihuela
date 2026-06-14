"use client"

import { OrderStatus } from "@/lib/types"
import { CheckCircle2, Circle, Loader2 } from "lucide-react"

interface OrderTimelineProps {
  status: OrderStatus
}

const TIMELINE_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "pending", label: "Pendiente" },
  { status: "assigned", label: "Asignado" },
  { status: "at_store", label: "En tienda" },
  { status: "on_the_way", label: "En camino" },
  { status: "delivered", label: "Entregado" },
]

function getStepState(status: OrderStatus, currentStatus: OrderStatus): "completed" | "current" | "pending" {
  const statusOrder: OrderStatus[] = ["pending", "assigned", "at_store", "on_the_way", "delivered"]
  const currentIndex = statusOrder.indexOf(currentStatus)
  const stepIndex = statusOrder.indexOf(status)

  if (currentStatus === "cancelled") {
    return "pending"
  }

  if (stepIndex < currentIndex) return "completed"
  if (stepIndex === currentIndex) return "current"
  return "pending"
}

export function OrderTimeline({ status }: OrderTimelineProps) {
  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-red-600 text-lg font-bold">✕</span>
        </div>
        <div>
          <p className="text-body-md font-semibold text-red-900">Pedido cancelado</p>
          <p className="text-label-md text-red-600">Este pedido fue cancelado</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {TIMELINE_STEPS.map((step, index) => {
        const state = getStepState(step.status, status)
        const isLast = index === TIMELINE_STEPS.length - 1

        return (
          <div key={step.status} className="flex items-center gap-0 flex-shrink-0">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  state === "completed"
                    ? "bg-primary text-white"
                    : state === "current"
                    ? "bg-primary text-white ring-4 ring-primary/20"
                    : "bg-surface-container text-muted-foreground"
                }`}
              >
                {state === "completed" ? (
                  <CheckCircle2 className="size-5" />
                ) : state === "current" ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <Circle className="size-5" />
                )}
              </div>
              <p
                className={`mt-1 text-label-md font-medium ${
                  state === "current" ? "text-primary" : state === "completed" ? "text-on-surface" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </p>
            </div>

            {!isLast && (
              <div
                className={`w-8 h-0.5 mb-4 mx-0.5 rounded ${
                  state === "completed" ? "bg-primary" : "bg-outline"
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}