"use client"

import { useEffect, useState } from "react"

/**
 * Detects if the viewport is below the given breakpoint.
 * Returns `false` during SSR and the first client render to avoid
 * hydration mismatches — the real value is set in an effect.
 *
 * @param breakpoint - The mobile breakpoint in pixels (default 768, the standard
 *                     Tailwind `md` threshold). The hook treats anything strictly
 *                     below this width as mobile.
 */
export function useIsMobile(breakpoint = 768): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMobile(mq.matches)
    mq.addEventListener("change", handler)
    return () => mq.removeEventListener("change", handler)
  }, [breakpoint])

  return isMobile
}
