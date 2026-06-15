import Link from "next/link"
import { Home } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Página no encontrada",
  description: "La página que buscas no existe o fue movida.",
  robots: "noindex, nofollow",
}

export default function RootNotFound() {
  return (
    <main className="relative flex min-h-[max(884px,100dvh)] items-center justify-center overflow-hidden bg-surface plus-pattern px-5 py-10">
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[260px] rounded-full bg-primary/10 blur-[80px]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-sm sm:p-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
        <span
          aria-hidden
          className="text-display-xl font-extrabold leading-none tracking-tighter text-primary tabular-nums animate-in fade-in zoom-in-95 duration-500 [animation-delay:80ms]"
        >
          404
        </span>

        <h1
          className="mt-4 text-headline-md font-bold text-on-surface text-balance animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:180ms]"
        >
          Página no encontrada
        </h1>

        <p
          className="mt-2 max-w-sm text-body-md text-on-surface-variant text-pretty animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:280ms]"
        >
          La ruta que intentas visitar no existe. Vuelve al inicio y te
          llevamos por el camino correcto.
        </p>

        <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:380ms]">
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
          >
            <Home className="size-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  )
}
