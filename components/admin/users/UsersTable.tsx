"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserRoleBadge } from "./UserRoleBadge"
import { UserRowActions } from "./UserRowActions"
import { getFullName, getInitials, formatUserDate } from "@/lib/users/format"
import type { UserWithProfile } from "@/lib/types"

interface UsersTableProps {
  users: UserWithProfile[]
  currentUserId: string | null
  onEdit: (user: UserWithProfile) => void
  onDelete: (user: UserWithProfile) => void
}

export function UsersTable({
  users,
  currentUserId,
  onEdit,
  onDelete,
}: UsersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-surface-container-low hover:bg-surface-container-low">
          <TableHead>Usuario</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Teléfono</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Creado</TableHead>
          <TableHead className="w-12 text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="h-32 text-center">
              <div className="mx-auto max-w-md">
                <p className="text-body-md text-on-surface-variant">
                  No hay usuarios registrados
                </p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => {
            const fullName = getFullName(user.first_name, user.last_name)
            const initials = getInitials(user.first_name, user.last_name)
            return (
              <TableRow key={user.id} className="transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar size="default">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-semibold text-on-surface">
                        {fullName}
                      </span>
                      {user.id === currentUserId && (
                        <span className="text-label-md text-primary font-medium">
                          Tú
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-body-md">{user.email}</span>
                </TableCell>
                <TableCell>
                  {user.phone ? (
                    <span className="text-body-md">{user.phone}</span>
                  ) : (
                    <span className="text-body-md text-on-surface-variant italic">
                      —
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <UserRoleBadge role={user.role} />
                </TableCell>
                <TableCell>
                  <span className="text-body-md text-on-surface-variant">
                    {formatUserDate(user.auth_created_at)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end">
                    <UserRowActions
                      user={user}
                      currentUserId={currentUserId}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </div>
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}
