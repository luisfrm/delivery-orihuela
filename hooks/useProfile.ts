"use client"

import { useState, useCallback, useEffect } from "react"

interface ProfileData {
  firstName: string
  lastName: string
  phone: string
  email: string
}

let cachedProfile: ProfileData | null = null

export function useProfile() {
  const [profile, setProfile] = useState<ProfileData | null>(cachedProfile)
  const [isLoading, setIsLoading] = useState(!cachedProfile)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async (force = false) => {
    if (!force && cachedProfile) {
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const { getProfile } = await import("@/lib/actions/profile")
      const result = await getProfile()
      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
        return
      }
      const data = result as ProfileData
      cachedProfile = data
      setProfile(data)
      setIsLoading(false)
    } catch {
      setError("Ocurrió un error al cargar el perfil.")
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile()
  }, [fetchProfile])

  const refresh = useCallback(() => fetchProfile(true), [fetchProfile])

  const updateCachedProfile = useCallback((data: ProfileData) => {
    cachedProfile = data
    setProfile(data)
    setError(null)
    setIsLoading(false)
  }, [])

  return { profile, isLoading, error, refresh, updateCachedProfile, fetchProfile }
}