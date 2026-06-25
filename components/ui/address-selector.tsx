"use client"

import { useEffect, useState } from "react"
import { MapPin, Plus } from "lucide-react"
import { UserAddress } from "@/lib/types"
import { getAddresses } from "@/lib/actions/addresses"
import {
  ListItemSelector,
  ListItem,
  ListItemContent,
} from "@/components/ui/list-item-selector"

interface AddressSelection {
  type: "existing" | "new"
  addressId: string | null
  addressName?: string
  addressLine?: string
}

interface AddressSelectorProps {
  value: AddressSelection
  onChange: (value: AddressSelection) => void
  onAddNewRequest?: () => void
}

export function AddressSelector({ value, onChange }: AddressSelectorProps) {
  const [addresses, setAddresses] = useState<UserAddress[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAddresses() {
      const data = await getAddresses()
      setAddresses(data)
      setIsLoading(false)
    }
    fetchAddresses()
  }, [])

  const handleSelect = (address: UserAddress) => {
    onChange({
      type: "existing",
      addressId: address.id,
      addressName: address.name,
      addressLine: address.address_line,
    })
  }

  const selectedId = value.type === "existing" ? value.addressId : null

  return (
    <ListItemSelector
      items={addresses}
      selectedId={selectedId}
      onSelect={handleSelect}
      getItemId={(item) => item.id}
      searchPlaceholder="Buscar dirección..."
      showSearch={false}
      isLoading={isLoading}
      emptyMessage="No tienes direcciones guardadas"
      renderItem={(address, isSelected) => (
        <ListItem isSelected={isSelected}>
          <ListItemContent
            icon={<MapPin className="size-5" />}
            title={address.name || "Sin nombre"}
            subtitle={address.address_line}
          />
        </ListItem>
      )}
      footerAction={
        <button
          type="button"
          onClick={() =>
            onChange({ type: "new", addressId: null })
          }
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
        >
          <Plus className="size-4" />
          <span className="font-medium">Agregar nueva dirección</span>
        </button>
      }
    />
  )
}

export type { AddressSelection }