"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"

export type ScrollShadowDirection = "x" | "y" | "both"

interface ScrollShadowProps {
  children: ReactNode
  direction?: ScrollShadowDirection
  className?: string
  scrollClassName?: string
  shadowClassName?: string
  shadowSize?: number
}

/**
 * Wraps a scrollable area and renders gradient overlays on the edges where
 * there is more content to scroll. Detects scroll position via the `scroll`
 * event and content size via `ResizeObserver` so shadows stay in sync as
 * children are added/removed.
 *
 * The default shadow color is `from-black/10 rounded-xl` — a very soft black that reads
 * as a subtle shadow on light backgrounds. Override with `shadowClassName`
 * (e.g. `from-white/10` for dark backgrounds, or `from-black/20` for a
 * stronger effect).
 */
export function ScrollShadow({
  children,
  direction = "y",
  className,
  scrollClassName,
  shadowClassName,
  shadowSize = 24,
}: ScrollShadowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showStart, setShowStart] = useState(false)
  const [showEnd, setShowEnd] = useState(false)
  const [showTop, setShowTop] = useState(false)
  const [showBottom, setShowBottom] = useState(false)

  const showX = direction === "x" || direction === "both"
  const showY = direction === "y" || direction === "both"

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    const update = () => {
      if (showX) {
        setShowStart(el.scrollLeft > 0)
        setShowEnd(el.scrollLeft + el.clientWidth < el.scrollWidth - 1)
      }
      if (showY) {
        setShowTop(el.scrollTop > 0)
        setShowBottom(el.scrollTop + el.clientHeight < el.scrollHeight - 1)
      }
    }

    update()
    el.addEventListener("scroll", update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)

    return () => {
      el.removeEventListener("scroll", update)
      ro.disconnect()
    }
  }, [showX, showY])

  return (
    <div className={cn("relative", className)}>
      <div
        ref={scrollRef}
        className={cn("h-full w-full overflow-auto", scrollClassName)}
      >
        {children}
      </div>

      {showX ? (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 transition-opacity duration-200 motion-reduce:transition-none",
            "bg-gradient-to-r from-black/10 rounded-xl to-transparent",
            showStart ? "opacity-100" : "opacity-0",
            shadowClassName
          )}
          style={{ width: shadowSize }}
        />
      ) : null}
      {showX ? (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 transition-opacity duration-200 motion-reduce:transition-none",
            "bg-gradient-to-l from-black/10 rounded-xl to-transparent",
            showEnd ? "opacity-100" : "opacity-0",
            shadowClassName
          )}
          style={{ width: shadowSize }}
        />
      ) : null}
      {showY ? (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 transition-opacity duration-200 motion-reduce:transition-none",
            "bg-gradient-to-b from-black/10 rounded-xl to-transparent",
            showTop ? "opacity-100" : "opacity-0",
            shadowClassName
          )}
          style={{ height: shadowSize }}
        />
      ) : null}
      {showY ? (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 transition-opacity duration-200 motion-reduce:transition-none",
            "bg-gradient-to-t from-black/10 rounded-xl to-transparent",
            showBottom ? "opacity-100" : "opacity-0",
            shadowClassName
          )}
          style={{ height: shadowSize }}
        />
      ) : null}
    </div>
  )
}
