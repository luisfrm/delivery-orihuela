"use client"

import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

interface UsersLoadMoreProps {
  hasMore: boolean
  isLoading: boolean
  onLoadMore: () => void
  label?: string
  showing: number
  total: number
}

export function UsersLoadMore({ hasMore, isLoading, onLoadMore, label = "Cargar más", showing, total }: UsersLoadMoreProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-outline-variant bg-surface-container-low/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-label-md text-on-surface-variant text-center sm:text-left">
        Mostrando {showing} de {total} resultado{total !== 1 ? "s" : ""}
      </p>

      {hasMore ? (
        <Button
          variant="secondary"
          size="default"
          onClick={onLoadMore}
          disabled={isLoading}
          className="w-full sm:w-auto min-w-[180px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Cargando...
            </>
          ) : (
            label
          )}
        </Button>
      ) : (
        <p className="text-label-md text-on-surface-variant text-center sm:text-right">No hay más usuarios</p>
      )}
    </div>
  )
}
