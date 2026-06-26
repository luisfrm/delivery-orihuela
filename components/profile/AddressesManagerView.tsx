"use client"

import { useEffect, useState } from "react"
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

import { UserAddress } from "@/lib/types"
import { getAddresses, deleteAddress } from "@/lib/actions/addresses"
import { ListItemContent } from "@/components/ui/list-item-selector"
import { InlineActionsMenu } from "@/components/ui/inline-actions-menu"
import { Button } from "@/components/ui/button"

interface AddressesManagerViewProps {
  onEditAddress: (addressId: string) => void
  onAddAddress: () => void
  onBack: () => void
}

export function AddressesManagerView({
  onEditAddress,
  onAddAddress,
  onBack,
}: AddressesManagerViewProps) {
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadAddresses = async () => {
    setIsLoading(true)
    const data = await getAddresses()
    setAddresses(data)
    setIsLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAddresses()
  }, [])

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const result = await deleteAddress(id)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success("Dirección eliminada")
      setConfirmingDeleteId(null)
      await loadAddresses()
    } catch {
      toast.error("No se pudo eliminar la dirección. Intenta de nuevo.")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="pt-4 space-y-4">
      <div>
        <h2 className="text-lg font-bold text-on-surface">Mis direcciones</h2>
        <p className="text-sm text-on-surface-variant mt-0.5 leading-snug">
          Gestiona tus direcciones de entrega
        </p>
      </div>

      {isLoading ? (
        <ul className="space-y-2" aria-busy="true" aria-live="polite">
          {Array.from({ length: 2 }).map((_, i) => (
            <li
              key={i}
              className="flex items-center gap-3 px-3 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest"
            >
              <div className="size-10 rounded-lg bg-outline-variant/40 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-outline-variant/40 animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-outline-variant/40 animate-pulse" />
              </div>
            </li>
          ))}
        </ul>
      ) : addresses.length === 0 ? (
        <div className="py-12 text-center text-body-md text-on-surface-variant">
          No tienes direcciones guardadas
        </div>
      ) : (
        <ul className="space-y-2">
          {addresses.map((address) => {
            const isConfirming = confirmingDeleteId === address.id
            const isDeleting = deletingId === address.id
            return (
              <li
                key={address.id}
                className="flex items-center gap-2 px-3 py-3 rounded-xl border border-outline-variant bg-surface-container-lowest"
              >
                <ListItemContent
                  icon={<MapPin className="size-5" />}
                  title={address.name || "Sin nombre"}
                  subtitle={address.address_line}
                />
                {isConfirming ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-label-md text-on-surface-variant">
                      ¿Eliminar?
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmingDeleteId(null)}
                      disabled={isDeleting}
                    >
                      No
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(address.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "..." : "Sí"}
                    </Button>
                  </div>
                ) : (
                  <InlineActionsMenu triggerLabel="Acciones de la dirección">
                    {(close) => (
                      <>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            close()
                            onEditAddress(address.id)
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
                            setConfirmingDeleteId(address.id)
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
          })}
        </ul>
      )}

      <Button
        variant="ghost"
        size="lg"
        className="w-full text-primary hover:bg-primary/5"
        onClick={onAddAddress}
      >
        <Plus className="size-4" />
        Agregar nueva dirección
      </Button>

      <Button
        variant="outline_primary"
        size="lg"
        className="w-full"
        onClick={onBack}
      >
        Volver
      </Button>
    </div>
  )
}
