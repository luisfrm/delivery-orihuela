"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { Order } from "@/lib/types"

interface UseOrdersOptions {
  initialOrders: Order[]
  userId: string
}

export function useOrders({ initialOrders, userId }: UseOrdersOptions) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!userId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`user-orders-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `client_id=eq.${userId}`,
        },
        (payload) => {
          const newOrder = payload.new as Order
          setOrders((prev) => [newOrder, ...prev])
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `client_id=eq.${userId}`,
        },
        (payload) => {
          const updatedOrder = payload.new as Order
          setOrders((prev) =>
            prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("client_id", userId)
      .order("created_at", { ascending: false })
    if (data) setOrders(data)
    setIsLoading(false)
  }, [userId])

  return { orders, isLoading, refresh }
}