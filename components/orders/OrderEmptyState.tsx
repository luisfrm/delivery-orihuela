"use client"

import { Package } from "lucide-react"
import Link from "next/link"

export function OrderEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-4">
        <Package className="size-10 text-muted-foreground" />
      </div>
      <h3 className="text-headline-md font-bold text-on-surface mb-2">
        No tienes pedidos todavía
      </h3>
      <p className="text-body-md text-on-surface-variant mb-6 max-w-xs">
        Cuando hagas un pedido, aparecerá aquí para que puedas seguir su estado.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors"
      >
        Hacer un pedido
      </Link>
    </div>
  )
}