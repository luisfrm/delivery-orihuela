"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Truck, MapPin, CheckCircle, X, XCircle } from "lucide-react"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  acceptOrder,
  arriveAtCustomer,
  cancelOrderByAdmin,
  completeOrder,
  startDelivery,
  unassignOrder,
} from "@/lib/actions/orders"
import type { OrderStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

interface OrderActionsCardProps {
  orderId: string
  status: OrderStatus
  className?: string
  onActionComplete?: () => void
}

export function OrderActionsCard({
  orderId,
  status,
  className,
  onActionComplete,
}: OrderActionsCardProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const isTerminal = status === "delivered" || status === "cancelled"

  if (isTerminal) return null

  const runAction = async (
    label: string,
    fn: () => Promise<{ success?: boolean; error?: string }>
  ) => {
    setIsSubmitting(true)
    try {
      const result = await fn()
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(label)
        onActionComplete?.()
        router.refresh()
      }
    } catch {
      toast.error("Ocurrió un error. Intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAccept = () => runAction("Pedido aceptado", () => acceptOrder(orderId))
  const handleStart = () =>
    runAction("Entrega iniciada", () => startDelivery(orderId))
  const handleArrive = () =>
    runAction("Rider llegó al cliente", () => arriveAtCustomer(orderId))
  const handleComplete = () =>
    runAction("Pedido completado", () => completeOrder(orderId))
  const handleUnassign = () =>
    runAction("Pedido desasignado", () => unassignOrder(orderId))
  const handleCancel = async () => {
    setShowCancelConfirm(false)
    await runAction("Pedido cancelado", () => cancelOrderByAdmin(orderId))
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Acciones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2.5">
          {status === "pending" && (
            <Button
              variant="success"
              size="lg"
              className="w-full"
              onClick={handleAccept}
              disabled={isSubmitting}
            >
              <Check className="size-4" />
              Aceptar pedido
            </Button>
          )}

          {status === "assigned" && (
            <>
              <Button
                variant="info"
                size="lg"
                className="w-full"
                onClick={handleStart}
                disabled={isSubmitting}
              >
                <Truck className="size-4" />
                Iniciar entrega
              </Button>
              <Button
                variant="ghost"
                size="default"
                className="w-full text-warning hover:text-warning hover:bg-warning/10"
                onClick={handleUnassign}
                disabled={isSubmitting}
              >
                <X className="size-4" />
                Desasignar repartidor
              </Button>
            </>
          )}

          {status === "on_the_way" && (
            <Button
              variant="info"
              size="lg"
              className="w-full"
              onClick={handleArrive}
              disabled={isSubmitting}
            >
              <MapPin className="size-4" />
              Llegué al cliente
            </Button>
          )}

          {status === "at_customer" && (
            <Button
              variant="success"
              size="lg"
              className="w-full"
              onClick={handleComplete}
              disabled={isSubmitting}
            >
              <CheckCircle className="size-4" />
              Marcar completado
            </Button>
          )}

          {!showCancelConfirm ? (
            <Button
              variant="destructive"
              size="default"
              className="w-full"
              onClick={() => setShowCancelConfirm(true)}
              disabled={isSubmitting}
            >
              <XCircle className="size-4" />
              Cancelar pedido
            </Button>
          ) : (
            <div
              className={cn(
                "rounded-lg border border-destructive/30 bg-destructive/5 p-3 space-y-2"
              )}
            >
              <p className="text-body-sm text-on-surface">
                ¿Seguro que quieres cancelar este pedido? El estado del rider se
                mantiene para auditoría.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline_primary"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowCancelConfirm(false)}
                  disabled={isSubmitting}
                >
                  Volver
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Sí, cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
