import type { UserRole } from "@/lib/types"

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  rider: "Repartidor",
  user: "Cliente",
}

export function formatRoleLabel(role: UserRole): string {
  return ROLE_LABELS[role] ?? role
}

export function formatUserDate(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso))
}

export function formatUserDateTime(iso: string): string {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso))
}

export function getInitials(firstName: string, lastName: string): string {
  const first = firstName.trim().charAt(0).toUpperCase()
  const last = lastName.trim().charAt(0).toUpperCase()
  return `${first}${last}` || "?"
}

export function getFullName(
  firstName: string | null | undefined,
  lastName: string | null | undefined
): string {
  const first = (firstName ?? "").trim()
  const last = (lastName ?? "").trim()
  if (!first && !last) return "Sin nombre"
  return `${first} ${last}`.trim()
}
