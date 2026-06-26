import { Home, Briefcase, MapPin, Bike, Phone, User, Store as StoreIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ContactClientActions } from "./ContactClientActions"
import { formatPhoneForCall } from "@/lib/orders/format"
import type { OrderStatus, OrderWithClient, RiderContact } from "@/lib/types"

function getInitials(firstName: string, lastName: string): string {
  const f = (firstName ?? "").trim().charAt(0).toUpperCase()
  const l = (lastName ?? "").trim().charAt(0).toUpperCase()
  return `${f}${l}` || "?"
}

function getAddressIcon(name: string | null, className: string) {
  const lower = (name ?? "").toLowerCase()
  if (lower.includes("casa") || lower.includes("hogar")) {
    return <Home className={className} />
  }
  if (lower.includes("oficina") || lower.includes("trabajo")) {
    return <Briefcase className={className} />
  }
  return <MapPin className={className} />
}

function fullName(person: { first_name: string; last_name: string } | null | undefined): string {
  if (!person) return ""
  return [person.first_name, person.last_name].filter(Boolean).join(" ").trim()
}

interface OrderGeneralInfoCardProps {
  order: OrderWithClient
  className?: string
}

export function OrderGeneralInfoCard({
  order,
  className,
}: OrderGeneralInfoCardProps) {
  const client = order.client
  const rider = order.rider
  const clientName = fullName(client)

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Información General</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Cliente */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Avatar size="lg" className="bg-secondary-fixed text-on-secondary-fixed">
              <AvatarFallback className="bg-secondary-fixed text-on-secondary-fixed font-bold">
                {getInitials(client?.first_name ?? "", client?.last_name ?? "")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
                Cliente
              </p>
              <p className="text-body-lg font-semibold text-on-surface truncate">
                {clientName || "Cliente desconocido"}
              </p>
              {client?.phone && (
                <a
                  href={`tel:${formatPhoneForCall(client.phone)}`}
                  className="inline-flex items-center gap-1 text-body-md text-primary hover:underline mt-0.5"
                >
                  <Phone className="size-3.5" />
                  {client.phone}
                </a>
              )}
            </div>
          </div>

          {client && (
            <ContactClientActions
              client={client}
              size="sm"
              orientation="horizontal"
              className="w-full hidden lg:inline-flex"
            />
          )}

          {order.deliveryAddress && (
            <div className="flex items-start gap-3 p-3 rounded-lg bg-surface-container-low">
              {getAddressIcon(
                order.deliveryAddress.name,
                "size-5 text-primary shrink-0 mt-0.5"
              )}
              <div className="flex-1 min-w-0">
                <p className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
                  Dirección de entrega
                </p>
                <p className="text-body-md font-semibold text-on-surface truncate">
                  {order.deliveryAddress.name}
                </p>
                <p className="text-body-sm text-on-surface-variant">
                  {order.deliveryAddress.address_line}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-outline-variant" />

        {/* Repartidor (sin botones de contacto) */}
        <div className="space-y-3">
          <p className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
            Repartidor
          </p>

          {rider ? (
            <RiderInfo rider={rider} status={order.status} />
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low">
              <Avatar size="lg" className="bg-surface-container-high text-on-surface-variant">
                <AvatarFallback className="bg-surface-container-high text-on-surface-variant">
                  <User className="size-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-body-md font-semibold text-on-surface italic">
                  Sin asignar
                </p>
                <p className="text-label-md text-on-surface-variant">
                  Aún no hay rider para este pedido
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Tienda */}
        {(order.storeName || order.custom_store_name) && (
          <>
            <div className="border-t border-outline-variant" />
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <StoreIcon className="size-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
                  Establecimiento
                </p>
                <p className="text-body-md font-semibold text-on-surface truncate">
                  {order.custom_store_name ?? order.storeName}
                </p>
                {order.custom_store_address && (
                  <p className="text-body-sm text-on-surface-variant truncate">
                    {order.custom_store_address}
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {order.additional_notes && (
          <>
            <div className="border-t border-outline-variant" />
            <div className="rounded-lg bg-surface-container-low p-3">
              <p className="text-label-md text-on-surface-variant uppercase tracking-wider font-semibold mb-1">
                Notas adicionales
              </p>
              <p className="text-body-md text-on-surface italic">
                {order.additional_notes}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function RiderInfo({ rider, status }: { rider: RiderContact; status: OrderStatus }) {
  const statusLabel = (() => {
    if (status === "assigned") return "Asignado — esperando inicio"
    if (status === "on_the_way") return "En camino al cliente"
    if (status === "at_customer") return "En el domicilio del cliente"
    if (status === "delivered") return "Entrega completada"
    if (status === "cancelled") return "Pedido cancelado"
    return "Asignado"
  })()

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low">
      <Avatar size="lg" className="bg-secondary-fixed text-on-secondary-fixed">
        <AvatarFallback className="bg-secondary-fixed text-on-secondary-fixed font-bold">
          {getInitials(rider.first_name, rider.last_name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-body-md font-semibold text-on-surface truncate">
          {fullName(rider)}
        </p>
        <div className="flex items-center gap-1 text-label-md text-on-surface-variant">
          <Bike className="size-3.5" />
          <span className="truncate">{statusLabel}</span>
        </div>
      </div>
    </div>
  )
}
