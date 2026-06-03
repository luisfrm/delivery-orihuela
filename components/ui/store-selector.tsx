"use client"

import { useEffect, useState } from "react"
import { MapPin } from "lucide-react"
import { Store } from "@/lib/types"
import { getStores } from "@/lib/actions/stores"
import { cn } from "@/lib/utils"
import {
  ListItemSelector,
  ListItem,
  ListItemContent,
} from "@/components/ui/list-item-selector"

export interface StoreSelection {
  type: "store" | "custom"
  storeId: string | null
  storeName: string
  storeAddress: string
}

interface StoreSelectorProps {
  value: StoreSelection
  onChange: (value: StoreSelection) => void
}

const CUSTOM_OPTION_ID = "__custom__"

interface CustomStoreOption {
  id: string
  type: "custom"
}

function isCustomStore(item: Store | { id: string; type: "custom" }): item is { id: string; type: "custom" } {
  return "type" in item && (item as { type: string }).type === "custom"
}

export function StoreSelector({ value, onChange }: StoreSelectorProps) {
  const [stores, setStores] = useState<Store[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStores() {
      const data = await getStores()
      setStores(data)
      setIsLoading(false)
    }
    fetchStores()
  }, [])

  const handleSelect = (item: Store | { id: string; type: "custom" }) => {
    if (isCustomStore(item)) {
      onChange({
        type: "custom",
        storeId: null,
        storeName: "",
        storeAddress: "",
      })
    } else {
      const store = item as Store
      onChange({
        type: "store",
        storeId: store.id,
        storeName: store.name,
        storeAddress: store.address,
      })
    }
  }

  const handleCustomNameChange = (name: string) => {
    onChange({
      type: "custom",
      storeId: null,
      storeName: name,
      storeAddress: value.storeAddress,
    })
  }

  const handleCustomAddressChange = (address: string) => {
    onChange({
      type: "custom",
      storeId: null,
      storeName: value.storeName,
      storeAddress: address,
    })
  }

  const selectedId = value.type === "store" ? value.storeId : CUSTOM_OPTION_ID

  return (
    <div className="space-y-4">
      {!isLoading && stores.length > 0 && (
        <>
          <ListItemSelector
            items={stores}
            selectedId={selectedId}
            onSelect={handleSelect}
            getItemId={(item) => item.id}
            searchPlaceholder="Buscar establecimiento..."
            showSearch={value.type !== "custom"}
            emptyMessage=""
            renderItem={(store, isSelected) => (
              <ListItem isSelected={isSelected}>
                <ListItemContent
                  icon={<MapPin className="size-5" />}
                  title={store.name}
                  subtitle={store.address || "Sin dirección"}
                />
              </ListItem>
            )}
            footerAction={
              value.type !== "custom" && (
                <button
                  type="button"
                  onClick={() => handleSelect({ id: CUSTOM_OPTION_ID, type: "custom" } as CustomStoreOption)}
                  className="w-full"
                >
                  <ListItem isSelected={selectedId === CUSTOM_OPTION_ID}>
                    <ListItemContent
                      icon={<span className="text-lg">🏪</span>}
                      title="Otro"
                      subtitle="Establecimiento no listado"
                    />
                  </ListItem>
                </button>
              )
            }
          />

          {value.type === "store" && !value.storeId && (
            <p className="text-center text-body-sm text-muted-foreground italic">
              Seleccionar comercio
            </p>
          )}
        </>
      )}

      

      <div className="space-y-3">
        <div>
          <label className="text-label-lg text-on-surface pl-1 font-medium block mb-1.5">
            Nombre del establecimiento *
          </label>
          <input
            type="text"
            value={value.storeName}
            onChange={(e) => handleCustomNameChange(e.target.value)}
            placeholder="Ej: Panadería López"
            disabled={value.type === "store"}
            className={cn(
              "w-full h-12 px-4 rounded-lg border-2 text-base transition-all",
              value.type === "store"
                ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                : "border-primary/30 bg-surface-container-lowest text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            )}
          />
        </div>
        <div>
          <label className="text-label-lg text-on-surface pl-1 font-medium block mb-1.5">
            Dirección del establecimiento *
          </label>
          <input
            type="text"
            value={value.storeAddress}
            onChange={(e) => handleCustomAddressChange(e.target.value)}
            placeholder="Ej: Calle Mayor 123, Orihuela"
            disabled={value.type === "store"}
            className={cn(
              "w-full h-12 px-4 rounded-lg border-2 text-base transition-all",
              value.type === "store"
                ? "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed"
                : "border-primary/30 bg-surface-container-lowest text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            )}
          />
        </div>
      </div>
    </div>
  )
}