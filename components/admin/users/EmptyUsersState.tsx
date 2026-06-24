import { Users as UsersIcon } from "lucide-react"

interface EmptyUsersStateProps {
  variant?: "staff" | "clients" | "all"
}

const COPY: Record<NonNullable<EmptyUsersStateProps["variant"]>, { title: string; description: string }> = {
  all: {
    title: "No hay usuarios registrados",
    description:
      "Cuando alguien se registre en la app o crees un miembro del staff aparecerá aquí.",
  },
  staff: {
    title: "No hay miembros del staff",
    description:
      "Crea el primer administrador o repartidor para empezar a gestionar tu equipo.",
  },
  clients: {
    title: "No hay clientes registrados",
    description:
      "Cuando un cliente se registre en la app aparecerá en esta lista.",
  },
}

export function EmptyUsersState({ variant = "all" }: EmptyUsersStateProps) {
  const copy = COPY[variant]

  return (
    <div className="flex flex-1 items-center justify-center py-16">
      <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-8 text-center shadow-sm">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-container">
          <UsersIcon className="size-10 text-white" />
        </div>

        <div className="space-y-2">
          <h2 className="text-headline-md font-bold text-on-surface">
            {copy.title}
          </h2>
          <p className="text-body-md text-on-surface-variant">
            {copy.description}
          </p>
        </div>
      </div>
    </div>
  )
}
