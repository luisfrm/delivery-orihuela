"use client"

import { useMemo, useState } from "react"

import type { UserWithProfile } from "@/lib/types"
import { UsersTabs, type UsersTabFilter } from "./UsersTabs"
import { UsersTable } from "./UsersTable"
import { UserCard } from "./UserCard"
import { UserFormModal } from "./UserFormModal"
import { DeleteUserModal } from "./DeleteUserModal"
import { EmptyUsersState } from "./EmptyUsersState"

interface AdminUsersManagerProps {
  initialUsers: UserWithProfile[]
  currentUserId: string | null
}

function getStaffCount(users: UserWithProfile[]): number {
  return users.filter((u) => u.role === "admin" || u.role === "rider").length
}

function getClientsCount(users: UserWithProfile[]): number {
  return users.filter((u) => u.role === "user").length
}

export function AdminUsersManager({
  initialUsers,
  currentUserId,
}: AdminUsersManagerProps) {
  const [users, setUsers] = useState<UserWithProfile[]>(initialUsers)
  const [selectedTab, setSelectedTab] = useState<UsersTabFilter>("staff")
  const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null)
  const [deletingUser, setDeletingUser] = useState<UserWithProfile | null>(null)

  const counts = useMemo(
    () => ({
      staff: getStaffCount(users),
      clients: getClientsCount(users),
    }),
    [users]
  )

  const filteredUsers = useMemo(() => {
    if (selectedTab === "staff") {
      return users.filter((u) => u.role === "admin" || u.role === "rider")
    }
    return users.filter((u) => u.role === "user")
  }, [users, selectedTab])

  const handleSaved = (updated: UserWithProfile) => {
    setUsers((prev) => {
      const exists = prev.find((u) => u.id === updated.id)
      if (exists) {
        return prev.map((u) => (u.id === updated.id ? updated : u))
      }
      return [updated, ...prev]
    })
    setEditingUser(null)
  }

  const emptyVariant: "staff" | "clients" | "all" =
    users.length === 0
      ? "all"
      : selectedTab === "staff" && counts.staff === 0
        ? "staff"
        : "clients"

  return (
    <>
      <div className="max-w-7xl rounded-xl border border-outline-variant overflow-hidden bg-surface-container-lowest">
        <UsersTabs
          selectedTab={selectedTab}
          onTabChange={setSelectedTab}
          counts={counts}
        />

        {users.length === 0 ? (
          <EmptyUsersState variant={emptyVariant} />
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto max-w-md">
              <p className="text-body-md text-on-surface-variant">
                No hay {selectedTab === "staff" ? "miembros del staff" : "clientes"} registrados
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden lg:block">
              <UsersTable
                users={filteredUsers}
                currentUserId={currentUserId}
                onEdit={setEditingUser}
                onDelete={setDeletingUser}
              />
            </div>
            <div className="lg:hidden p-4 space-y-3">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  currentUserId={currentUserId}
                  onEdit={setEditingUser}
                  onDelete={setDeletingUser}
                />
              ))}
            </div>
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
      />
    </>
  )
}
