"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import {
  CreditCard,
  Pencil,
  Plus,
  Trash2,
  Type,
  ImageIcon,
  GripVertical,
} from "lucide-react"
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react"
import { useSortable } from "@dnd-kit/react/sortable"
import { move } from "@dnd-kit/helpers"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { InlineActionsMenu } from "@/components/ui/inline-actions-menu"
import { cn } from "@/lib/utils"
import { PaymentMethodFormModal } from "./PaymentMethodFormModal"
import {
  deletePaymentMethodAction,
  getPaymentMethodsAction,
  updatePaymentMethodsOrderAction,
} from "@/lib/actions/payment-methods"
import type { PaymentMethod } from "@/lib/types/payment-methods"

export function PaymentsManager() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isSavingOrder, startSavingOrder] = useTransition()
  const previousOrderRef = useRef<PaymentMethod[]>([])

  const loadMethods = async () => {
    setIsLoading(true)
    const data = await getPaymentMethodsAction()
    setMethods(data)
    setIsLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMethods()
  }, [])

  const handleAdd = () => {
    setEditingMethod(null)
    setIsFormOpen(true)
  }

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const result = await deletePaymentMethodAction(id)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success("Método de pago eliminado")
      setConfirmingDeleteId(null)
      await loadMethods()
    } catch {
      toast.error("No se pudo eliminar el método. Intenta de nuevo.")
    } finally {
      setDeletingId(null)
    }
  }

  const handleFormSuccess = async () => {
    setIsFormOpen(false)
    setEditingMethod(null)
    await loadMethods()
  }

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.canceled) return
    const next = move(methods, event)
    if (next === methods) return

    previousOrderRef.current = methods
    setMethods(next)

    startSavingOrder(async () => {
      const result = await updatePaymentMethodsOrderAction(next.map((m) => m.id))
      if (result?.error) {
        toast.error("No se pudo guardar el orden")
        setMethods(previousOrderRef.current)
      } else {
        toast.success("Orden actualizado")
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-on-surface">Métodos de pago</h2>
          <p className="text-sm text-on-surface-variant mt-0.5 leading-snug">
            Define los métodos de pago disponibles. El cliente llenará los
            valores al hacer un pedido.
          </p>
        </div>
        <Button onClick={handleAdd} size="sm" className="shrink-0">
          <Plus className="size-4" />
          Agregar método
        </Button>
      </div>

      {isLoading ? (
        <ul className="grid gap-3 sm:grid-cols-2" aria-busy="true" aria-live="polite">
          {Array.from({ length: 4 }).map((_, i) => (
            <li
              key={i}
              className="flex items-center gap-3 p-4 rounded-2xl border border-outline-variant bg-surface-container-lowest"
            >
              <div className="size-10 rounded-xl bg-outline-variant/40 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 rounded bg-outline-variant/40 animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-outline-variant/40 animate-pulse" />
              </div>
            </li>
          ))}
        </ul>
      ) : methods.length === 0 ? (
        <div className="py-10 text-center border border-dashed border-outline-variant rounded-2xl bg-surface-container-low/50">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CreditCard className="size-6" />
          </div>
          <p className="mt-3 text-body-md font-medium text-on-surface">Sin métodos aún</p>
          <p className="text-body-sm text-on-surface-variant mt-1">Crea el primero — ej. Bizum, efectivo, tarjeta.</p>
          <Button onClick={handleAdd} variant="outline_primary" size="sm" className="mt-4">
            <Plus className="size-4" />
            Crear método
          </Button>
        </div>
      ) : (
        <DragDropProvider onDragEnd={handleDragEnd}>
          <ul className="grid gap-3 sm:grid-cols-2">
            {methods.map((method, index) => {
              const isConfirming = confirmingDeleteId === method.id
              const isDeleting = deletingId === method.id
              return (
                <SortableMethodRow
                  key={method.id}
                  method={method}
                  index={index}
                  isConfirming={isConfirming}
                  isDeleting={isDeleting}
                  isSavingOrder={isSavingOrder}
                  onEdit={() => handleEdit(method)}
                  onCancelConfirm={() => setConfirmingDeleteId(null)}
                  onAskDelete={() => setConfirmingDeleteId(method.id)}
                  onConfirmDelete={() => handleDelete(method.id)}
                />
              )
            })}
          </ul>
        </DragDropProvider>
      )}

      <PaymentMethodFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        method={editingMethod}
        onSuccess={handleFormSuccess}
      />

      <PaymentMethodFieldTypeLegend />
    </div>
  )
}

interface SortableMethodRowProps {
  method: PaymentMethod
  index: number
  isConfirming: boolean
  isDeleting: boolean
  isSavingOrder: boolean
  onEdit: () => void
  onCancelConfirm: () => void
  onAskDelete: () => void
  onConfirmDelete: () => void
}

function SortableMethodRow({
  method,
  index,
  isConfirming,
  isDeleting,
  isSavingOrder,
  onEdit,
  onCancelConfirm,
  onAskDelete,
  onConfirmDelete,
}: SortableMethodRowProps) {
  const { ref, handleRef, isDragging } = useSortable({
    id: method.id,
    index,
  })

  return (
    <li
      ref={ref}
      className={cn(
        "group relative flex items-center gap-3 p-4 rounded-2xl border bg-surface-container-lowest transition-all",
        isDragging
          ? "opacity-40 border-primary/40 shadow-md"
          : "border-outline-variant hover:border-primary/25 hover:shadow-sm"
      )}
    >
      <button
        type="button"
        ref={handleRef as React.Ref<HTMLButtonElement>}
        aria-label={`Reordenar método ${method.name}`}
        disabled={isSavingOrder}
        className="flex-shrink-0 touch-none cursor-grab-custom active:cursor-grabbing-custom rounded-lg p-1.5 text-on-surface-variant/50 hover:text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50"
      >
        <GripVertical className="size-4" />
      </button>
      <div className="flex-shrink-0 size-10 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
        <CreditCard className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-body-sm font-semibold text-on-surface truncate leading-none">
            {method.name}
          </p>
          {!method.isActive && (
            <Badge variant="muted" className="shrink-0 rounded-full px-2 py-0 text-[10px]">
              Inactivo
            </Badge>
          )}
        </div>
        <p className="text-label-md text-on-surface-variant truncate mt-1">
          {method.fields.length === 0
            ? "Sin campos"
            : `${method.fields.length} ${
                method.fields.length === 1 ? "campo" : "campos"
              } · ${method.fields
                .map((f) => f.label)
                .filter(Boolean)
                .join(", ")}`}
        </p>
      </div>
      {isConfirming ? (
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-label-md text-on-surface-variant">¿Eliminar?</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancelConfirm}
            disabled={isDeleting}
          >
            No
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "..." : "Sí"}
          </Button>
        </div>
      ) : (
        <InlineActionsMenu triggerLabel={`Acciones de ${method.name}`}>
          {(close) => (
            <>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  close()
                  onEdit()
                }}
                className="w-full flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer text-left"
              >
                <Pencil className="size-4" />
                Editar
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  close()
                  onAskDelete()
                }}
                className="w-full flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm text-destructive hover:bg-destructive/10 cursor-pointer text-left"
              >
                <Trash2 className="size-4" />
                Eliminar
              </button>
            </>
          )}
        </InlineActionsMenu>
      )}
    </li>
  )
}

function PaymentMethodFieldTypeLegend() {
  return (
    <div className="flex flex-wrap items-center gap-3 pt-2 text-label-md text-on-surface-variant">
      <span className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/50 bg-surface-container px-2.5 py-1">
        <Type className="size-3.5" />
        Texto
      </span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-outline-variant/50 bg-surface-container px-2.5 py-1">
        <ImageIcon className="size-3.5" />
        Imagen
      </span>
      <span className="text-label-md text-on-surface-variant/70">Arrastra para reordenar</span>
    </div>
  )
}
