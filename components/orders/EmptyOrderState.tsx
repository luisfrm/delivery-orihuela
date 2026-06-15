import Link from "next/link"
import { ShoppingBag, Sparkles, Tag } from "lucide-react"

import { Card } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface EmptyOrdersStateProps {
  onBrowse?: () => void
}

export function EmptyOrdersState({ onBrowse }: EmptyOrdersStateProps) {
  return (
    <div className="flex flex-col items-center text-center py-10 sm:py-16 px-4">
      <div className="relative w-28 h-28 sm:w-40 sm:h-40 mb-6">
        <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl" />
        <div className="relative flex items-center justify-center w-full h-full rounded-full bg-primary/5">
          <ShoppingBag className="size-14 sm:size-20 text-primary" />
        </div>
      </div>

      <h2 className="text-headline-md sm:text-headline-lg font-bold text-on-surface mb-2">
        Aún no tienes pedidos
      </h2>
      <p className="text-body-md text-on-surface-variant max-w-md mb-6">
        Parece que todavía no has pedido nada. ¡Tu comida favorita está a solo
        unos clics de distancia!
      </p>

      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Button
          variant="primary"
          size="lg"
          className="w-full sm:w-auto"
          onClick={onBrowse}
        >
          <ShoppingBag />
          Hacer un pedido
        </Button>
        <Link
          href="/promociones"
          className={cn(buttonVariants({ variant: "tertiary", size: "lg" }), "w-full sm:w-auto")}
        >
          Ver promociones
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-10 w-full max-w-2xl">
        <Card variant="surface" className="p-4 items-start gap-2 text-left">
          <Sparkles className="size-6 text-primary" />
          <h3 className="text-title-lg font-semibold">Favoritos</h3>
          <p className="text-body-md text-on-surface-variant">
            Lo más pedido por la comunidad.
          </p>
        </Card>
        <Card variant="surface" className="p-4 items-start gap-2 text-left">
          <Tag className="size-6 text-primary" />
          <h3 className="text-title-lg font-semibold">Ofertas de hoy</h3>
          <p className="text-body-md text-on-surface-variant">
            Descuentos exclusivos por tiempo limitado.
          </p>
        </Card>
      </div>
    </div>
  )
}