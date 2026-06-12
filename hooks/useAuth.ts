"use client"

import { useEffect, useState } from "react"
import { User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"
import { UserRole } from "@/lib/types"

interface UseAuthReturn {
  user: User | null
  role: UserRole | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Derive role directly from user state (re-evaluated on every render if user changes)
  const role = user ? (user.app_metadata?.role as UserRole ?? "user") : null

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    const initialize = async () => {
      const { data } = await supabase.auth.getSession()
      if (!isMounted) return

      setUser(data.session?.user ?? null)

      if (isMounted) setIsLoading(false)
    }

    initialize()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) return

        setUser(session?.user ?? null)

        if (isMounted) setIsLoading(false)
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  return {
    user,
    role,
    isLoading,
    isAuthenticated: !!user,
  }
}