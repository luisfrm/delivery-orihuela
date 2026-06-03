"use server"

import { createClient } from "@/lib/supabase/server"

export async function getSetting(key: string): Promise<string | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", key)
    .single()

  if (error || !data) {
    return null
  }

  return data.value as string
}

export async function getDeliveryFee(): Promise<number> {
  const fee = await getSetting("delivery_fee")
  return fee ? parseFloat(fee) : 4
}