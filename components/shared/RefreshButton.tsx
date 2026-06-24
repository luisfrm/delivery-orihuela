"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Loader2, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { REFRESH_CONFIG } from "@/lib/config/refresh"
import { cn } from "@/lib/utils"

interface RefreshButtonProps {
  onRefresh: () => Promise<void> | void
  cooldownSeconds?: number
  label?: string
  variant?: "primary" | "secondary" | "tertiary" | "outline" | "outline_primary" | "ghost" | "link" | "toolbar" | "success" | "info" | "destructive"
  size?: "default" | "sm" | "lg" | "xl" | "icon" | "icon-xs" | "icon-sm" | "icon-lg" | "icon-xl"
  className?: string
}

export function RefreshButton({
  onRefresh,
  cooldownSeconds = REFRESH_CONFIG.cooldownSeconds,
  label = "Refrescar",
  variant = "outline_primary",
  size = "default",
  className,
}: RefreshButtonProps) {
  const [remaining, setRemaining] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const startCooldown = useCallback(() => {
    clearTimer()
    setRemaining(cooldownSeconds)
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearTimer()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [cooldownSeconds, clearTimer])

  useEffect(() => {
    return () => clearTimer()
  }, [clearTimer])

  const handleClick = async () => {
    if (remaining > 0 || isRefreshing) return
    setIsRefreshing(true)
    try {
      await onRefresh()
    } finally {
      setIsRefreshing(false)
      startCooldown()
    }
  }

  const isDisabled = remaining > 0 || isRefreshing
  const text = isRefreshing
    ? "Actualizando..."
    : remaining > 0
      ? `Se activará en ${remaining}s`
      : label

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={handleClick}
      disabled={isDisabled}
      className={cn("min-w-[180px]", className)}
    >
      {isRefreshing ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <RefreshCw className="size-4" />
      )}
      {text}
    </Button>
  )
}
