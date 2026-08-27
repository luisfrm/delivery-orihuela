"use client"

import { Plus, Trash2, Type, ImageIcon, Eye, GripVertical } from "lucide-react"
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react"
import { useSortable } from "@dnd-kit/react/sortable"
import { move } from "@dnd-kit/helpers"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
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
        "rounded-xl border border-outline-variant bg-surface-container-lowest p-3 space-y-3",
        isDragging && "opacity-40"
      )}
    >
      {/* Header: drag + icono + titulo + borrar */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          ref={handleRef as React.Ref<HTMLButtonElement>}
          aria-label={`Reordenar campo ${index + 1}`}
          className="flex-shrink-0 touch-none cursor-grab-custom active:cursor-grabbing-custom rounded-lg p-1.5 text-on-surface-variant/60 hover:text-on-surface-variant hover:bg-surface-container transition-colors"
        >
          <GripVertical className="size-4" />
        </button>
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {field.type === "text" ? (
            <Type className="size-4" />
          ) : field.type === "image" ? (
            <ImageIcon className="size-4" />
          ) : (
            <Eye className="size-4" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-label-lg font-semibold leading-none text-on-surface">Campo {index + 1}</p>
          <p className="text-label-md text-on-surface-variant">
            {field.type === "text" ? "Texto" : field.type === "image" ? "Imagen" : "Visual fijo"}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          aria-label={`Eliminar campo ${index + 1}`}
          className="shrink-0 text-on-surface-variant hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {/* Body: stack vertical ordenado — Select, Etiqueta, Valor */}
      <div className="space-y-3 pt-1">
        <div className="space-y-1.5">
          <label className="text-label-md font-medium text-on-surface pl-1">
            Tipo de campo
          </label>
          <Select
            options={
              FIELD_TYPE_OPTIONS as unknown as {
                value: string
                label: string
              }[]
            }
            value={field.type}
            onChange={(value) => onUpdate({ type: value as PaymentMethodFieldType })}
            aria-label={`Tipo del campo ${index + 1}`}
            size="default"
            className="w-full"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-label-md font-medium text-on-surface pl-1">
            Etiqueta
          </label>
          <Input
            value={field.label}
            onChange={(e) => onUpdate({ label: e.target.value })}
            placeholder={isVisual ? "Ej. Banco, DNI, Cuenta" : "Ej. Teléfono, QR, Alias"}
            maxLength={MAX_FIELD_LABEL}
            aria-label={`Etiqueta del campo ${index + 1}`}
            size="sm"
          />
          <p className="text-label-md text-on-surface-variant pl-1 text-right">
            {field.label.length}/{MAX_FIELD_LABEL}
          </p>
        </div>

        {isVisual && (
          <div className="space-y-1.5">
            <label className="text-label-md font-medium text-on-surface pl-1">
              Valor
            </label>
            <Textarea
              value={field.value ?? ""}
              onChange={(e) => onUpdate({ value: e.target.value })}
              placeholder="Ej. ES12 3456 7890 1234 5678 — instrucciones, múltiples líneas"
              rows={3}
              maxLength={MAX_FIELD_VALUE}
              aria-label={`Valor del campo ${index + 1}`}
              className="min-h-[96px] resize-y"
            />
            <p className="text-label-md text-on-surface-variant pl-1 text-right">
              {(field.value ?? "").length}/{MAX_FIELD_VALUE}
            </p>
          </div>
        )}
      </div>
    </li>
  )
}
