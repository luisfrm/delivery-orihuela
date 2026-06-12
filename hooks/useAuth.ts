"use client"

import { useEffect, useState, useCallback } from "react"
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
  const [role, setRole] = useState<UserRole | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchRole = useCallback(async () => {
    try {
      const { getUserRole } = await import("@/lib/actions/auth")
      const { role: userRole } = await getUserRole()
      setRole(userRole)
    } catch {
      setRole(null)
    }
  }, [])

  useEffect(() => {
    const supabase = createClient()
    let isMounted = true

    const initialize = async () => {
      const { data } = await supabase.auth.getSession()
      if (!isMounted) return

      const currentUser = data.session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        await fetchRole()
      }

      if (isMounted) setIsLoading(false)
    }

    initialize()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          await fetchRole()
        } else {
          setRole(null)
        }

        if (isMounted) setIsLoading(false)
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [fetchRole])

  return {
    user,
    role,
    isLoading,
    isAuthenticated: !!user,
  }
}