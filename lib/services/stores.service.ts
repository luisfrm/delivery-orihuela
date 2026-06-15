import { Store, StoreWithMetadata } from "@/lib/types"
import { parseCategoryIds } from "@/lib/restaurants/categories"

export interface CreateStoreParams {
  name: string
  address: string
  phone: string
  description: string | null
  categoryIds: string[]
  coverImageUrl: string | null
  logoImageUrl: string | null
}

export interface CreateStoreResult {
  store?: Store
  error?: string
}

type SupabaseClient = Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>

export class StoresService {
  constructor(private supabase: SupabaseClient) {}

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

  async getStoresWithMetadata(): Promise<StoreWithMetadata[]> {
    const { data, error } = await this.supabase
      .from("stores")
      .select(`
        *,
        products(id, is_active)
      `)
      .order("name")

    if (error) {
      console.error("Error fetching stores with metadata:", error)
      return []
    }

    return (data || []).map((store) => {
      const raw = store as Store & {
        products?: { is_active: boolean }[]
      }

      const products = Array.isArray(raw.products) ? raw.products : []
      const active_items_count = products.filter((p) => p.is_active).length

      const { products: _p, ...rest } = raw
      void _p

      return {
        ...(rest as Store),
        active_items_count,
        category_ids: parseCategoryIds(raw.category_ids),
      }
    })
  }

  async createStore(params: CreateStoreParams): Promise<CreateStoreResult> {
    const serializedCategoryIds = params.categoryIds.join(";")

    const { data, error } = await this.supabase
      .from("stores")
      .insert({
        name: params.name,
        address: params.address,
        phone: params.phone,
        description: params.description,
        cover_image_url: params.coverImageUrl,
        logo_url: params.logoImageUrl,
        category_ids: serializedCategoryIds || null,
      })
      .select("*")
      .single()

    if (error) {
      console.error("Error creating store:", error)
      return { error: error.message }
    }

    return { store: data }
  }
}
