"use server"

import { createClient } from "@/lib/supabase/server"
import { StoresService } from "@/lib/services/stores.service"
import { Store } from "@/lib/types"

export async function getStores(): Promise<Store[]> {
  const supabase = await createClient()
  const service = new StoresService(supabase)
  return service.getStores()
}

export async function getStoreById(storeId: string): Promise<Store | null> {
  const supabase = await createClient()
  const service = new StoresService(supabase)
  return service.getStoreById(storeId)
}