"use client"

import { useState, useEffect } from "react"
import { subscribeUser, unsubscribeUser } from "@/lib/actions/push"

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const supported = "serviceWorker" in navigator && "PushManager" in window
    setIsSupported(supported)

    if (supported) {
      setPermission(Notification.permission)
      checkSubscription()
    } else {
      setIsLoading(false)
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js")
      const subscription = await registration.pushManager.getSubscription()
      setIsSubscribed(!!subscription)

      // Sincronizar con el backend si ya existe localmente (ej: si falló el guardado previo)
      if (subscription) {
        await subscribeUser(subscription.toJSON())
      }
    } catch (error) {
      console.error("[Push] Error checking subscription:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  const subscribeToPush = async () => {
    setIsLoading(true)
    try {
      const registration = await navigator.serviceWorker.register("/sw.js")

      // Request permission
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === "granted") {
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!vapidPublicKey) {
          throw new Error("VAPID public key not found")
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        })

        const res = await subscribeUser(subscription.toJSON())
        if (res.error) {
          throw new Error(res.error)
        }
        setIsSubscribed(true)
      }
    } catch (error) {
      console.error("[Push] Error subscribing:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const unsubscribeFromPush = async () => {
    setIsLoading(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()
        await unsubscribeUser(subscription.endpoint)
        setIsSubscribed(false)
      }
    } catch (error) {
      console.error("[Push] Error unsubscribing:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isSupported,
    permission,
    isSubscribed,
    subscribeToPush,
    unsubscribeFromPush,
    isLoading,
  }
}
