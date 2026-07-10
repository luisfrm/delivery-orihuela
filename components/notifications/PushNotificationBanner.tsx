"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { usePushNotifications } from "@/hooks/usePushNotifications"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"

export function PushNotificationBanner() {
  const { isAuthenticated } = useAuth()
  const { isSupported, permission, isSubscribed, subscribeToPush, isLoading } = usePushNotifications()
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(true)

  useEffect(() => {
    // Check local storage for dismissed state
    const dismissed = localStorage.getItem("push_dismissed") === "true"
    setIsDismissed(dismissed)
  }, [])

  useEffect(() => {
    if (
      isAuthenticated &&
      isSupported &&
      !isSubscribed &&
      permission === "default" &&
      !isDismissed &&
      !isLoading
    ) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }, [isAuthenticated, isSupported, isSubscribed, permission, isDismissed, isLoading])

  if (!isVisible) return null

  const handleDismiss = () => {
    localStorage.setItem("push_dismissed", "true")
    setIsDismissed(true)
    setIsVisible(false)
  }

  const handleSubscribe = async () => {
    await subscribeToPush()
    // If they accept or deny, the permission state will update and hide the banner automatically
  }

  return (
    <div className="fixed bottom-[80px] left-0 right-0 z-30 p-4 lg:hidden">
      <div className="bg-surface-container rounded-2xl shadow-lg border border-outline-variant p-4 flex flex-col gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 p-2 rounded-full mt-1 shrink-0">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-on-surface text-label-lg mb-1">
              ¿Quieres recibir notificaciones?
            </h3>
            <p className="text-on-surface-variant text-label-md">
              Activa las notificaciones para recibir actualizaciones de tus pedidos en tiempo real. Solo te avisaremos sobre cambios importantes.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-1">
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            Ahora no
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubscribe}>
            Activar notificaciones
          </Button>
        </div>
      </div>
    </div>
  )
}
