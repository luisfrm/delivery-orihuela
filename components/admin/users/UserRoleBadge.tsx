import { ShieldCheck, Bike, ShoppingBag } from "lucide-react"

import type { UserRole } from "@/lib/types"
import { formatRoleLabel } from "@/lib/users/format"
import { cn } from "@/lib/utils"

interface UserRoleBadgeProps {
  role: UserRole
  className?: string
}

const ROLE_CONFIG: Record<
  UserRole,
  {
    icon: typeof ShieldCheck
    className: string
  }
> = {
  admin: {
    icon: ShieldCheck,
    className:
      "bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary",
  },
  rider: {
    icon: Bike,
    className:
      "bg-secondary/20 text-amber-800 border border-amber-300/60 dark:bg-secondary/20 dark:text-amber-200",
  },
  user: {
    icon: ShoppingBag,
    className:
      "bg-surface-container-high text-on-surface-variant border border-outline-variant",
  },
}

export function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  const config = ROLE_CONFIG[role]
  const Icon = config.icon

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-label-md font-semibold",
        config.className,
        className
      )}
    >
      <Icon className="size-3.5" />
      {formatRoleLabel(role)}
    </span>
  )
}
