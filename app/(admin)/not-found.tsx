import Link from "next/link"
import { Compass, LayoutDashboard } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Página no encontrada — Panel Admin",
  robots: "noindex, nofollow",
}

export default function AdminNotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center py-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Card variant="surface" className="w-full max-w-xl">
        <CardContent className="space-y-5 p-8 sm:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Compass className="size-6" strokeWidth={2} />
            </div>
            <Badge variant="secondary" className="font-extrabold tracking-tight">
              404
            </Badge>
          </div>

          <div className="space-y-2">
            <h1 className="text-headline-md font-bold text-on-surface text-balance">
              Página no encontrada
            </h1>
            <p className="text-body-md text-on-surface-variant text-pretty">
              La ruta solicitada no existe o fue movida. Verifica la URL o
              vuelve al panel para continuar.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/panel"
              className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
            >
              <LayoutDashboard className="size-4" />
              Volver al dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
