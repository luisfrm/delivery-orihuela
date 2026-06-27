export type PaymentMethodFieldType = "text" | "image" | "visual"

/**
 * Estructura de un campo dinámico definido por el admin.
 *
 * - Para campos `text` e `image`: el cliente llena el `value` en
 *   checkout. `value` no se usa aquí.
 * - Para campos `visual`: el admin define un `value` que se muestra
 *   al cliente como información (ej. "Banco XYZ"). El cliente
 *   no interactúa con este campo.
 */
export interface PaymentMethodFieldDefinition {
  /**
   * UUID generado en cliente con `crypto.randomUUID()`.
   * Estable a través de la vida del campo. Se usa como referencia
   * desde `orders` para guardar el valor que el usuario llena.
   */
  id: string
  type: PaymentMethodFieldType
  /** Etiqueta visible al usuario, ej. "Teléfono", "QR", "Banco" */
  label: string
  /**
   * Contenido del campo. Solo se usa para campos `visual`
   * (el admin lo define). Para `text` e `image` queda vacío
   * en la definición y se llena en checkout.
   */
  value?: string
}

export interface PaymentMethod {
  id: string
  name: string
  fields: PaymentMethodFieldDefinition[]
  position: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

/**
 * Valor de un campo del método de pago, tal como se guarda en
 * la columna `orders.payment_values` (JSONB). Es un SNAPSHOT:
 * incluye `label` para poder renderizar el recibo sin necesidad
 * de JOIN con `payment_methods`.
 *
 * `value` es texto plano para campos text, o la URL pública
 * del storage (organization-assets) para campos image.
 */
export interface PaymentFieldValue {
  fieldId: string
  type: PaymentMethodFieldType
  label: string
  value: string
}

/**
 * Input del form de checkout que viaja al server action.
 * Para campos text, `value` es el texto tipeado. Para campos
 * image, `value` es la URL pública del archivo (ya subido
 * por el cliente directamente a Supabase Storage usando su
 * propia sesión). Nunca es un File — la subida se hace en
 * el cliente, no en el server.
 */
export interface PaymentFieldInput {
  fieldId: string
  type: PaymentMethodFieldType
  label: string
  value: string
}

export const MAX_PAYMENT_METHOD_FIELDS = 3
export const MAX_PAYMENT_METHOD_NAME = 60
export const MAX_FIELD_LABEL = 30
export const MAX_FIELD_VALUE = 200

/**
 * Row tal como viene de Supabase. `fields` es JSONB.
 */
export interface PaymentMethodRow {
  id: string
  name: string
  fields: unknown
  position: number
  is_active: boolean
  created_at: string
  updated_at: string
}

function isPaymentMethodFieldDefinition(value: unknown): value is PaymentMethodFieldDefinition {
  if (!value || typeof value !== "object") return false
  const v = value as Record<string, unknown>
  if (typeof v.id !== "string" || v.id.length === 0) return false
  if (v.type !== "text" && v.type !== "image" && v.type !== "visual") return false
  if (typeof v.label !== "string") return false
  return true
}

/**
 * Convierte una fila de Supabase a `PaymentMethod` validando
 * la estructura de `fields`. Si el JSONB está corrupto, lo
 * descarta y devuelve un array vacío (defensa en profundidad).
 */
export function parsePaymentMethodRow(row: PaymentMethodRow): PaymentMethod {
  const fields: PaymentMethodFieldDefinition[] = Array.isArray(row.fields)
    ? (row.fields.filter(isPaymentMethodFieldDefinition) as PaymentMethodFieldDefinition[])
    : []

  return {
    id: row.id,
    name: row.name,
    fields,
    position: row.position,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export interface PaymentMethodInput {
  name: string
  fields: PaymentMethodFieldDefinition[]
  isActive: boolean
}

export interface PaymentMethodValidationError {
  field?: "name" | "fields"
  index?: number
  message: string
}

export function validatePaymentMethodInput(
  input: PaymentMethodInput
): PaymentMethodValidationError | null {
  const name = input.name.trim()
  if (!name) {
    return { field: "name", message: "El nombre es requerido." }
  }
  if (name.length > MAX_PAYMENT_METHOD_NAME) {
    return {
      field: "name",
      message: `El nombre no puede superar ${MAX_PAYMENT_METHOD_NAME} caracteres.`,
    }
  }

  if (input.fields.length > MAX_PAYMENT_METHOD_FIELDS) {
    return {
      field: "fields",
      message: `Máximo ${MAX_PAYMENT_METHOD_FIELDS} campos por método.`,
    }
  }

  for (let i = 0; i < input.fields.length; i++) {
    const f = input.fields[i]
    const label = (f.label ?? "").trim()
    if (!label) {
      return {
        field: "fields",
        index: i,
        message: `La etiqueta del campo ${i + 1} es requerida.`,
      }
    }
    if (label.length > MAX_FIELD_LABEL) {
      return {
        field: "fields",
        index: i,
        message: `La etiqueta del campo ${i + 1} no puede superar ${MAX_FIELD_LABEL} caracteres.`,
      }
    }
    if (f.type !== "text" && f.type !== "image" && f.type !== "visual") {
      return {
        field: "fields",
        index: i,
        message: `Tipo de campo inválido en el campo ${i + 1}.`,
      }
    }
    if (!f.id || typeof f.id !== "string") {
      return {
        field: "fields",
        index: i,
        message: `Identificador inválido en el campo ${i + 1}.`,
      }
    }
    if (f.type === "visual") {
      const value = (f.value ?? "").trim()
      if (!value) {
        return {
          field: "fields",
          index: i,
          message: `El valor del campo ${i + 1} es requerido.`,
        }
      }
      if (value.length > MAX_FIELD_VALUE) {
        return {
          field: "fields",
          index: i,
          message: `El valor del campo ${i + 1} no puede superar ${MAX_FIELD_VALUE} caracteres.`,
        }
      }
    }
  }

  return null
}
