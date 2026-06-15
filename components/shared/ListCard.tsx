import * as React from "react"

import { Card } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Badge, badgeVariants } from "@/components/ui/badge"
import { type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export interface ListCardBadge {
  label: string
  variant?: VariantProps<typeof badgeVariants>["variant"]
}

export interface ListCardAction {
  label: string
  icon?: React.ReactNode
  variant?: VariantProps<typeof buttonVariants>["variant"]
  onClick?: () => void
}

export interface ListCardProps {
  icon: React.ReactNode
  title: string
  subtitle?: string
  description?: string
  badge?: ListCardBadge
  action?: ListCardAction
  className?: string
}

export function ListCard({
  icon,
  title,
  subtitle,
  description,
  badge,
  action,
  className,
}: ListCardProps) {
  return (
    <Card variant="surface" className={cn("h-full p-4", className)}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-surface-container-high rounded-lg flex items-center justify-center text-primary shrink-0">
            {icon}
          </div>
          <div>
            <h4 className="text-title-lg font-bold">{title}</h4>
            {subtitle && (
              <p className="text-on-surface-variant text-label-md">{subtitle}</p>
            )}
          </div>
        </div>

        {badge && (
          <Badge variant={badge.variant ?? "secondary"} className="shrink-0">
            {badge.label}
          </Badge>
        )}
      </div>

      {description && (
        <p className="text-body-md text-on-surface-variant line-clamp-1 italic mb-6">
          {description}
        </p>
      )}

      {action && (
        <Button
          variant={action.variant ?? "secondary"}
          size="lg"
          className="w-full mt-auto"
          onClick={action.onClick}
        >
          {action.icon}
          {action.label}
        </Button>
      )}
    </Card>
  )
}