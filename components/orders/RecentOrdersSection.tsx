import { ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ListCard, type ListCardProps } from "@/components/shared/ListCard"

export interface RecentOrdersSectionProps {
  title?: string
  items: (ListCardProps & { id: string })[]
  viewAllLabel?: string
  onViewAll?: () => void
  className?: string
}

export function RecentOrdersSection({
  title = "Historial Reciente",
  items,
  viewAllLabel = "Ver todo el historial",
  onViewAll,
  className,
}: RecentOrdersSectionProps) {
  return (
    <section className={className}>
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <h2 className="text-headline-md text-on-surface">{title}</h2>
        {onViewAll && (
          <Button variant="link" className="text-primary" onClick={onViewAll}>
            {viewAllLabel}
            <ArrowRight />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {items.map(({ id, ...item }) => (
          <ListCard key={id} {...item} />
        ))}
      </div>
    </section>
  )
}