import { redirect } from "next/navigation"
import { Users as UsersIcon } from "lucide-react"

import { getUserCounts, getUsersPage } from "@/lib/actions/users"
import { getUserRole } from "@/lib/actions/auth"
import { createClient } from "@/lib/supabase/server"
import { AdminUsersManager } from "@/components/admin/users/AdminUsersManager"
import { AddUserButton } from "@/components/admin/users/AddUserButton"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Usuarios — Panel Delivery Orihuela",
  description: "Gestiona los miembros del staff (admins y riders) y los clientes.",
}

export default async function AdminUsersPage() {
  // Defensa en profundidad: solo admins pueden acceder.
  // El proxy.ts ya bloquea riders, pero verificamos también aquí.
  const { role } = await getUserRole()
  if (role !== "admin") {
    redirect("/?unauthorized=forbidden")
  }

  const pageSize = 25
  const [{ users: initialStaff, hasMore: initialHasMore }, counts, { data: { user } }] = await Promise.all([
    getUsersPage({ roleFilter: "staff", offset: 0, limit: pageSize }),
    getUserCounts(),
    (await createClient()).auth.getUser(),
  ])

  const total = counts.total
  const totalStaff = counts.staff

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <UsersIcon className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-headline-lg font-bold text-on-surface">
              Usuarios
            </h1>
            <p className="text-body-sm text-on-surface-variant">
              {total > 0
                ? `${total} usuario${total !== 1 ? "s" : ""} · ${totalStaff} del staff`
                : "Gestiona los miembros del staff y los clientes"}
            </p>
          </div>
        </div>

        <AddUserButton />
      </div>

      <AdminUsersManager
        initialUsers={initialStaff}
        initialHasMore={initialHasMore}
        initialCounts={{ staff: counts.staff, clients: counts.clients, total: counts.total }}
        currentUserId={user?.id ?? null}
        pageSize={pageSize}
      />
    </div>
  )
}
