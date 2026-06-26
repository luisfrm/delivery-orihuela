"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { MoreVertical } from "lucide-react"

interface InlineActionsMenuProps {
  triggerLabel: string
  children: (close: () => void) => ReactNode
}

export function InlineActionsMenu({
  triggerLabel,
  children,
}: InlineActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors"
      >
        <MoreVertical className="size-4" />
      </button>
      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 w-40 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 z-10"
        >
          {children(() => setIsOpen(false))}
        </div>
      )}
    </div>
  )
}
