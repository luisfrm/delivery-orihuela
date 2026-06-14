"use server"

import { createClient } from "@/lib/supabase/server"
import { SettingsService } from "@/lib/services/settings.service"

export async function getSetting(key: string): Promise<string | null> {
  const supabase = await createClient()
  const service = new SettingsService(supabase)
  return service.getSetting(key)
}

export async function getDeliveryFee(): Promise<number> {
  const supabase = await createClient()
  const service = new SettingsService(supabase)
  return service.getDeliveryFee()
}