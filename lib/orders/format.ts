export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(amount / 100)
}

export function formatOrderDate(dateString: string) {
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString))
}

export function formatOrderDateOnly(dateString: string) {
  return new Intl.DateTimeFormat("es", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateString))
}

export function formatOrderTimeOnly(dateString: string) {
  return new Intl.DateTimeFormat("es", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateString))
}

export function shortOrderId(id: string) {
  return id.slice(0, 8).toUpperCase()
}

/**
 * Normaliza un teléfono para construir un enlace de WhatsApp (`wa.me`).
 * - Asume que el teléfono viene en formato E.164 (incluye código de país).
 * - Elimina todo lo que no sea dígito.
 * - No incluye el `+` (wa.me no lo acepta).
 */
export function formatPhoneForWhatsApp(phone: string): string {
  return phone.replace(/\D/g, "")
}

/**
 * Normaliza un teléfono para construir un enlace `tel:`.
 * - Asume que el teléfono viene en formato E.164 (incluye código de país).
 * - Elimina todo lo que no sea dígito y los devuelve con `+` (formato E.164).
 */
export function formatPhoneForCall(phone: string): string {
  const digits = phone.replace(/\D/g, "")
  if (!digits) return ""
  return `+${digits}`
}