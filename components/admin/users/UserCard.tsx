"use client"

import { Mail, Phone, CalendarDays } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserRoleBadge } from "./UserRoleBadge"
import { UserRowActions } from "./UserRowActions"
import { getFullName, getInitials, formatUserDate } from "@/lib/users/format"
import type { UserWithProfile } from "@/lib/types"

interface UserCardProps {
  user: UserWithProfile
  currentUserId: string | null
  onEdit: (user: UserWithProfile) => void
  onDelete: (user: UserWithProfile) => void
}

export function UserCard({
  user,
  currentUserId,
  onEdit,
  onDelete,
}: UserCardProps) {
  const fullName = getFullName(user.first_name, user.last_name)
  const initials = getInitials(user.first_name, user.last_name)
  const isSelf = user.id === currentUserId

  return (
    <article className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar size="lg">
          <AvatarFallback className="bg-primary/10 text-primary text-base font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-title-lg font-bold text-on-surface truncate">
                {fullName}
                {isSelf && (
                  <span className="ml-2 text-label-md text-primary font-medium">
                    (Tú)
                  </span>
                )}
              </h3>
              <div className="mt-1">
                <UserRoleBadge role={user.role} />
              </div>
            </div>

            <UserRowActions
              user={user}
              currentUserId={currentUserId}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>

          <div className="mt-3 space-y-1.5 text-body-md text-on-surface-variant">
            <div className="flex items-center gap-2">
              <Mail className="size-4 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-2">
                <Phone className="size-4 shrink-0" />
                <span>{user.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <CalendarDays className="size-4 shrink-0" />
              <span>Creado el {formatUserDate(user.auth_created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}
