"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, MapPin } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { Store } from "@/lib/types"

interface MenuHeaderProps {
  store: Store
  className?: string
}

export function MenuHeader({ store, className }: MenuHeaderProps) {
  return (
    <div className={cn("flex gap-4 items-center", className)}>
      <Button
        variant="ghost"
        size="icon"
        nativeButton={false}
        render={<Link href="/panel/restaurants" />}
        aria-label="Volver a restaurantes"
      >
        <ArrowLeft className="size-5" />
      </Button>
      <div className="relative h-16 w-16 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border border-outline-variant bg-surface-container shadow-sm">
        {store.cover_image_url ? (
          <Image
            src={store.cover_image_url}
            alt={store.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-on-surface-variant/40">
            <MapPin className="size-6" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="text-headline-md font-bold text-on-surface truncate">
          {store.name}
        </h1>
        <p className="mt-0.5 flex items-center gap-1.5 text-body-sm text-on-surface-variant">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{store.address || "Sin dirección"}</span>
        </p>
      </div>
    </div>
  )
}
