"use client"

import { useCallback, useEffect, useState } from "react"

import type { UserWithProfile } from "@/lib/types"
import { getUsersPage } from "@/lib/actions/users"
import { UsersTabs, type UsersTabFilter } from "./UsersTabs"
import { UsersTable } from "./UsersTable"
import { UserCard } from "./UserCard"
import { UserFormModal } from "./UserFormModal"
import { DeleteUserModal } from "./DeleteUserModal"
import { EmptyUsersState } from "./EmptyUsersState"
import { UsersLoadMore } from "./UsersLoadMore"

interface AdminUsersManagerProps {
  initialUsers: UserWithProfile[]
  initialHasMore: boolean
  initialCounts: { staff: number; clients: number; total: number }
  currentUserId: string | null
  pageSize: number
}

type TabCache = Record<UsersTabFilter, { users: UserWithProfile[]; hasMore: boolean; loaded: boolean }>

function roleMatchesTab(role: string, tab: UsersTabFilter): boolean {
  if (tab === "staff") return role === "admin" || role === "rider"
  return role === "user"
}

export function AdminUsersManager({
  initialUsers,
  initialHasMore,
  initialCounts,
  currentUserId,
  pageSize,
}: AdminUsersManagerProps) {
  const [selectedTab, setSelectedTab] = useState<UsersTabFilter>("staff")
  const [cache, setCache] = useState<TabCache>({
    staff: { users: initialUsers, hasMore: initialHasMore, loaded: true },
    clients: { users: [], hasMore: true, loaded: false },
  })
  const [counts, setCounts] = useState(initialCounts)
  const [isLoading, setIsLoading] = useState(false)
  const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null)
  const [deletingUser, setDeletingUser] = useState<UserWithProfile | null>(null)

  // Sincroniza con SSR tras router.refresh() (ej. tras crear staff)
  useEffect(() => {
    setCache((prev) => ({
      ...prev,
      staff: { users: initialUsers, hasMore: initialHasMore, loaded: true },
    }))
    setCounts(initialCounts)
  }, [initialUsers, initialHasMore, initialCounts])

  const current = cache[selectedTab]
  const visibleUsers = current.users
  const hasMore = current.hasMore

  const fetchPage = useCallback(
    async (tab: UsersTabFilter, offset: number, replace: boolean) => {
      setIsLoading(true)
      const res = await getUsersPage({
        roleFilter: tab === "staff" ? "staff" : "clients",
        offset,
        limit: pageSize,
      })
      if (!res.error) {
        setCache((prev) => ({
          ...prev,
          [tab]: {
            users: replace ? res.users : [...prev[tab].users, ...res.users],
            hasMore: res.hasMore,
            loaded: true,
          },
        }))
      }
      setIsLoading(false)
    },
    [pageSize]
  )

  const handleTabChange = (tab: UsersTabFilter) => {
    if (tab === selectedTab) return
    setSelectedTab(tab)
    // Cargar si aún no se ha cargado ese tab (lazy)
    if (!cache[tab].loaded) {
      void fetchPage(tab, 0, true)
    }
  }

  const handleLoadMore = () => {
    void fetchPage(selectedTab, visibleUsers.length, false)
  }

  const handleSaved = (updated: UserWithProfile) => {
    // Actualiza counts si cambió de rol
    setCounts((prev) => {
      // Busca rol previo en cualquier tab
      const allPrev = [...cache.staff.users, ...cache.clients.users]
      const existing = allPrev.find((u) => u.id === updated.id)
      if (!existing) {
        // Nuevo usuario (solo staff puede crearse desde panel)
        if (updated.role === "admin" || updated.role === "rider") {
          return { ...prev, staff: prev.staff + 1, total: prev.total + 1 }
        }
        return { ...prev, clients: prev.clients + 1, total: prev.total + 1 }
      }
      if (existing.role === updated.role) return prev
      // Cambio de rol
      const wasStaff = existing.role === "admin" || existing.role === "rider"
      const isStaff = updated.role === "admin" || updated.role === "rider"
      if (wasStaff && !isStaff) return { ...prev, staff: prev.staff - 1, clients: prev.clients + 1 }
      if (!wasStaff && isStaff) return { ...prev, staff: prev.staff + 1, clients: prev.clients - 1 }
      return prev
    })

    // Actualiza cache: upsert en el tab correcto, remove del otro si cambió
    setCache((prev) => {
      const next: TabCache = {
        staff: { ...prev.staff, users: [...prev.staff.users] },
        clients: { ...prev.clients, users: [...prev.clients.users] },
      }
      const targetTab: UsersTabFilter = updated.role === "admin" || updated.role === "rider" ? "staff" : "clients"
      const otherTab: UsersTabFilter = targetTab === "staff" ? "clients" : "staff"

      // Remove from other tab if present
      next[otherTab].users = next[otherTab].users.filter((u) => u.id !== updated.id)
      // Upsert in target
      const idx = next[targetTab].users.findIndex((u) => u.id === updated.id)
      if (idx >= 0) next[targetTab].users[idx] = updated
      else next[targetTab].users.unshift(updated)

      return next
    })
    setEditingUser(null)
  }

  const handleDeleted = (deletedId: string) => {
    const deleted = [...cache.staff.users, ...cache.clients.users].find((u) => u.id === deletedId)
    if (deleted) {
      const wasStaff = deleted.role === "admin" || deleted.role === "rider"
      setCounts((prev) => ({
        total: Math.max(0, prev.total - 1),
        staff: wasStaff ? Math.max(0, prev.staff - 1) : prev.staff,
        clients: wasStaff ? prev.clients : Math.max(0, prev.clients - 1),
      }))
    }
    setCache((prev) => ({
      staff: { ...prev.staff, users: prev.staff.users.filter((u) => u.id !== deletedId) },
      clients: { ...prev.clients, users: prev.clients.users.filter((u) => u.id !== deletedId) },
    }))
    setDeletingUser(null)
  }

  // Escucha creaciones desde AddUserButton (fuera del manager)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<UserWithProfile>).detail
      if (detail) handleSaved(detail)
    }
    window.addEventListener("user-created", handler as EventListener)
    return () => window.removeEventListener("user-created", handler as EventListener)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const emptyVariant: "staff" | "clients" | "all" =
    counts.total === 0 ? "all" : selectedTab === "staff" && counts.staff === 0 ? "staff" : "clients"

  // Deriva el contenido según tab + paginación
  const isEmptyTotal = counts.total === 0
  const isEmptyTab = !isEmptyTotal && visibleUsers.length === 0 && !isLoading

  return (
    <>
      <div className="rounded-xl border border-outline-variant overflow-hidden bg-surface-container-lowest">
        <UsersTabs selectedTab={selectedTab} onTabChange={handleTabChange} counts={counts} />

        {isEmptyTotal ? (
          <EmptyUsersState variant="all" />
        ) : isEmptyTab ? (
          <div className="p-12 text-center">
            <div className="mx-auto max-w-md">
              <p className="text-body-md text-on-surface-variant">
                No hay {selectedTab === "staff" ? "miembros del staff" : "clientes"} registrados
              </p>
            </div>
          </div>
        ) : isLoading && visibleUsers.length === 0 ? (
          <div className="p-8 space-y-3">
            <div className="h-12 animate-pulse rounded-lg bg-surface-container" />
            <div className="h-12 animate-pulse rounded-lg bg-surface-container" />
            <div className="h-12 animate-pulse rounded-lg bg-surface-container" />
          </div>
        ) : (
          <>
            <div className="hidden lg:block">
              <UsersTable
                users={visibleUsers}
                currentUserId={currentUserId}
                onEdit={setEditingUser}
                onDelete={setDeletingUser}
              />
            </div>
            <div className="lg:hidden p-4 space-y-3">
              {visibleUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  currentUserId={currentUserId}
                  onEdit={setEditingUser}
                  onDelete={setDeletingUser}
                />
              ))}
            </div>
            <UsersLoadMore
              hasMore={hasMore}
              isLoading={isLoading}
              onLoadMore={handleLoadMore}
              showing={visibleUsers.length}
              total={selectedTab === "staff" ? counts.staff : counts.clients}
            />
          </>
        )}
      </div>

      <UserFormModal
        mode="edit"
        user={editingUser ?? undefined}
        open={editingUser !== null}
        onOpenChange={(open) => {
          if (!open) setEditingUser(null)
        }}
        onSaved={handleSaved}
      />

      <DeleteUserModal
        user={
          deletingUser ?? {
            id: "",
            email: "",
            first_name: "",
            last_name: "",
            phone: "",
            role: "user",
            created_at: "",
            auth_created_at: "",
          }
        }
        open={deletingUser !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingUser(null)
        }}
        onDeleted={handleDeleted}
      />
    </>
  )
}
