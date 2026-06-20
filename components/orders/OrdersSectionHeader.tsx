import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export interface OrdersSectionHeaderProps {
  icon: LucideIcon
  title: string
  iconClassName?: string
  className?: string
}

export function OrdersSectionHeader({
  icon: Icon,
  title,
  iconClassName = "text-primary",
  className,
}: OrdersSectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b border-outline-variant pb-2",
        className
      )}
    >
      <Icon className={cn("size-6", iconClassName)} />
      <h2 className="font-title-lg text-title-lg text-on-background">
        {title}
      </h2>
    </div>
  )
}
