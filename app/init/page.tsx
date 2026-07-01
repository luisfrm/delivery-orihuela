import { redirect } from "next/navigation"
import { ShieldAlert } from "lucide-react"
import { checkAdminExists } from "@/lib/actions/init"
import { InitForm } from "./_components/InitForm"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Configuración inicial — Delivery Orihuela",
  description: "Crea el primer administrador del sistema.",
  robots: "noindex, nofollow",
}

export default async function InitPage() {
  const { exists } = await checkAdminExists()

  // Si ya existe un admin, redirigir al panel
  if (exists) {
    redirect("/panel")
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 plus-pattern opacity-60" aria-hidden />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary/8 blur-[80px] pointer-events-none"
        aria-hidden
      />

      {/* Card central */}
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 mb-8">
          {/* Logo */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="text-white font-bold text-xl tracking-tight">LL</span>
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center shadow-sm border-2 border-surface">
              <ShieldAlert className="size-3.5 text-on-secondary-container" />
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-headline-md text-on-surface">Configuración inicial</h1>
            <p className="text-body-md text-on-surface-variant mt-1">
              Crea la cuenta de administrador para comenzar a usar el panel.
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-sm p-6">
          <InitForm />
        </div>

        <p className="text-center text-label-md text-on-surface-variant mt-5">
          Esta página solo está disponible una vez.
          <br />
          Una vez creado el admin, será redirigida automáticamente.
        </p>
      </div>
    </div>
  )
}
