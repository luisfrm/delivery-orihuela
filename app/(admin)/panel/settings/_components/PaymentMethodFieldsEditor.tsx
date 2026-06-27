"use client"

import { Plus, Trash2, Type, ImageIcon, Eye, GripVertical } from "lucide-react"
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react"
import { useSortable } from "@dnd-kit/react/sortable"
import { move } from "@dnd-kit/helpers"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  MAX_FIELD_LABEL,
  MAX_FIELD_VALUE,
  MAX_PAYMENT_METHOD_FIELDS,
  type PaymentMethodFieldDefinition,
  type PaymentMethodFieldType,
} from "@/lib/types/payment-methods"

interface PaymentMethodFieldsEditorProps {
  fields: PaymentMethodFieldDefinition[]
  onChange: (fields: PaymentMethodFieldDefinition[]) => void
}

const FIELD_TYPE_OPTIONS = [
  { value: "text", label: "Texto" },
  { value: "image", label: "Imagen" },
  { value: "visual", label: "Visual" },
] as const

export function PaymentMethodFieldsEditor({
  fields,
  onChange,
}: PaymentMethodFieldsEditorProps) {
  const canAdd = fields.length < MAX_PAYMENT_METHOD_FIELDS

  const updateField = (
    index: number,
    patch: Partial<PaymentMethodFieldDefinition>
  ) => {
    const next = fields.map((f, i) => (i === index ? { ...f, ...patch } : f))
    onChange(next)
  }

  const removeField = (index: number) => {
    onChange(fields.filter((_, i) => i !== index))
  }

  const addField = () => {
    if (!canAdd) return
    const newField: PaymentMethodFieldDefinition = {
      id: crypto.randomUUID(),
      type: "text",
      label: "",
    }
    onChange([...fields, newField])
  }

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.canceled) return
    const next = move(fields, event)
    if (next === fields) return
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-label-lg font-medium text-on-surface">
          Campos dinámicos
          <span className="text-on-surface-variant font-normal ml-1.5">
            (máx. {MAX_PAYMENT_METHOD_FIELDS})
          </span>
        </p>
      </div>

      {fields.length === 0 ? (
        <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low px-4 py-6 text-center text-body-sm text-on-surface-variant">
          Aún no hay campos. Agrega el primero para que el cliente ingrese datos.
        </div>
      ) : (
        <DragDropProvider onDragEnd={handleDragEnd}>
          <ul className="space-y-2">
            {fields.map((field, index) => (
              <SortableFieldRow
                key={field.id}
                field={field}
                index={index}
                onUpdate={(patch) => updateField(index, patch)}
                onRemove={() => removeField(index)}
              />
            ))}
          </ul>
        </DragDropProvider>
      )}

      <Button
        type="button"
        variant="outline_primary"
        size="sm"
        onClick={addField}
        disabled={!canAdd}
        className="w-full sm:w-auto"
      >
        <Plus className="size-4" />
        Agregar campo
      </Button>
    </div>
  )
}

interface SortableFieldRowProps {
  field: PaymentMethodFieldDefinition
  index: number
  onUpdate: (patch: Partial<PaymentMethodFieldDefinition>) => void
  onRemove: () => void
}

function SortableFieldRow({
  field,
  index,
  onUpdate,
  onRemove,
}: SortableFieldRowProps) {
  const { ref, handleRef, isDragging } = useSortable({
    id: field.id,
    index,
  })

  const isVisual = field.type === "visual"

  return (
    <li
      ref={ref}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-outline-variant bg-surface-container-lowest p-2.5",
        isDragging && "opacity-40"
      )}
    >
      <button
        type="button"
        ref={handleRef as React.Ref<HTMLButtonElement>}
        aria-label={`Reordenar campo ${index + 1}`}
        className="flex-shrink-0 touch-none cursor-grab-custom active:cursor-grabbing-custom rounded p-1 text-on-surface-variant hover:bg-surface-container-low transition-colors"
      >
        <GripVertical className="size-4" />
      </button>
      <div className="flex-shrink-0 size-8 rounded-md bg-primary/10 text-primary flex items-center justify-center">
        {field.type === "text" ? (
          <Type className="size-4" />
        ) : field.type === "image" ? (
          <ImageIcon className="size-4" />
        ) : (
          <Eye className="size-4" />
        )}
      </div>
      <div
        className={cn(
          "flex-1 gap-2",
          isVisual
            ? "grid grid-cols-1 md:grid-cols-[100px_1fr_1fr]"
            : "grid grid-cols-1 md:grid-cols-[100px_1fr]"
        )}
      >
        <Select
          options={
            FIELD_TYPE_OPTIONS as unknown as { value: string; label: string }[]
          }
          value={field.type}
          onChange={(value) =>
            onUpdate({ type: value as PaymentMethodFieldType })
          }
          aria-label={`Tipo del campo ${index + 1}`}
          size="lg"
          className="w-full"
        />
        <Input
          value={field.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          placeholder={
            isVisual
              ? "Etiqueta (ej. Banco, DNI, Cuenta)"
              : "Etiqueta (ej. Teléfono, QR, Alias)"
          }
          maxLength={MAX_FIELD_LABEL}
          aria-label={`Etiqueta del campo ${index + 1}`}
        />
        {isVisual && (
          <Input
            value={field.value ?? ""}
            onChange={(e) => onUpdate({ value: e.target.value })}
            placeholder="Valor (ej. Banco XYZ, 12345678)"
            maxLength={MAX_FIELD_VALUE}
            aria-label={`Valor del campo ${index + 1}`}
          />
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={onRemove}
        aria-label={`Eliminar campo ${index + 1}`}
        className="text-on-surface-variant hover:text-destructive"
      >
        <Trash2 className="size-4" />
      </Button>
    </li>
  )
}
