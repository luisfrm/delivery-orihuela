"use server"

import { createClient } from "@/lib/supabase/server"
import { Store } from "@/lib/types"

export async function getStores(): Promise<Store[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("stores")
    .select("*")
    .order("name")

  if (error) {
    console.error("Error fetching stores:", error)
    return []
  }

  return data || []
}