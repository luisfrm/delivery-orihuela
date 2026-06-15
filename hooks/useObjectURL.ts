"use client"

import { useEffect, useState } from "react"

/**
 * Manages an object URL for a File and revokes it when the file changes
 * or the component unmounts.
 *
 * The setState-in-effect pattern is required here because the browser
 * object URL is an external system that must be created via side effect.
 * The useMemo + cleanup pattern is unreliable in React Strict Mode.
 */
export function useObjectURL(file: File | null): string | null {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!file) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUrl(null)
      return
    }

    const newUrl = URL.createObjectURL(file)
    setUrl(newUrl)

    return () => {
      URL.revokeObjectURL(newUrl)
    }
  }, [file])

  return url
}
