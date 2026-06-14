import { Store } from "@/lib/types"

export class StoresService {
  constructor(private supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>) {}

  async getStores(): Promise<Store[]> {
    const { data, error } = await this.supabase
      .from("stores")
      .select("*")
      .order("name")

    if (error) {
      console.error("Error fetching stores:", error)
      return []
    }

    return data || []
  }

  async getStoreById(storeId: string): Promise<Store | null> {
    const { data, error } = await this.supabase
      .from("stores")
      .select("*")
      .eq("id", storeId)
      .single()

    if (error) {
      return null
    }

    return data
  }
}