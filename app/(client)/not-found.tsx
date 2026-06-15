import Link from "next/link"
import { Home, UtensilsCrossed } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Página no encontrada — Orihuela Delivery",
  description: "La página que buscas no existe o fue movida.",
  robots: "noindex, nofollow",
}

export default function ClientNotFound() {
  return (
    <section
      aria-labelledby="not-found-title"
      className="relative -mt-6 flex min-h-[calc(100dvh-72px-80px)] flex-col items-center justify-center overflow-hidden bg-primary plus-pattern px-5 py-10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-white/10 blur-[80px]"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center text-center">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-white shadow-lg ring-1 ring-white/20 animate-in fade-in zoom-in-95 duration-500"
        >
          <UtensilsCrossed className="size-7" strokeWidth={2} />
        </div>

        <span
          aria-hidden
          className="mt-6 text-display-xl font-extrabold leading-none tracking-tighter text-white tabular-nums [text-shadow:0_4px_24px_rgba(0,0,0,0.18)] animate-in fade-in slide-in-from-bottom-2 blur-in-sm duration-700 [animation-delay:80ms]"
        >
          404
        </span>

        <h1
          id="not-found-title"
          className="mt-4 text-headline-md font-bold text-white text-balance animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:180ms]"
        >
          Esta página se nos perdió
        </h1>

        <p
          className="mt-2 max-w-sm text-body-md text-white/80 text-pretty animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:280ms]"
        >
          Pero aún tenemos mucho sabor para ti. Vuelve al inicio y sigue
          explorando.
        </p>

        <div className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500 [animation-delay:380ms]">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "secondary", size: "lg" }),
              "shadow-lg shadow-black/10"
            )}
          >
            <Home className="size-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </section>
  )
}
