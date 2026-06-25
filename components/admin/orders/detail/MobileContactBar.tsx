import { ContactClientActions } from "./ContactClientActions"
import type { ClientContact } from "@/lib/types"

interface MobileContactBarProps {
  client: ClientContact | null
  className?: string
}

export function MobileContactBar({ client, className }: MobileContactBarProps) {
  if (!client || !client.phone) return null

  return (
    <div
      className={`lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-surface border-t border-outline-variant shadow-[0_-4px_12px_rgba(0,0,0,0.06)] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] ${className ?? ""}`}
    >
      <ContactClientActions client={client} size="default" orientation="horizontal" />
    </div>
  )
}
