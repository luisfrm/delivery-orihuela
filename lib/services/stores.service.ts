import { Product, Store, StoreWithMetadata } from "@/lib/types"
import { parseCategoryIds } from "@/lib/restaurants/categories"
import { parseCategoryOrder } from "@/lib/restaurants/menu-categories"
import { generateStoreSlug } from "@/lib/restaurants/slug"

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

export interface UpdateStoreParams {
  name: string
  address: string
  phone: string
  description: string | null
  categoryIds: string[]
  coverImageUrl: string | null
  logoImageUrl: string | null
}

export interface UpdateStoreResult {
  store?: Store
  error?: string
}

export interface DeleteStoreResult {
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

  async getStoreBySlug(slug: string): Promise<Store | null> {
    const { data, error } = await this.supabase
      .from("stores")
      .select("*")
      .eq("slug", slug)
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
        slug: generateStoreSlug(params.name),
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

  async updateStore(
    slug: string,
    params: UpdateStoreParams
  ): Promise<UpdateStoreResult> {
    const { data: current, error: fetchError } = await this.supabase
      .from("stores")
      .select("*")
      .eq("slug", slug)
      .single()

    if (fetchError || !current) {
      return { error: fetchError?.message ?? "Restaurante no encontrado." }
    }

    const serializedCategoryIds = params.categoryIds.join(";")

    const updateData: Record<string, unknown> = {
      name: params.name,
      address: params.address,
      phone: params.phone,
      description: params.description,
      cover_image_url: params.coverImageUrl,
      logo_url: params.logoImageUrl,
      category_ids: serializedCategoryIds || null,
    }

    if (params.name !== current.name) {
      updateData.slug = generateStoreSlug(params.name)
    }

    const { data, error } = await this.supabase
      .from("stores")
      .update(updateData)
      .eq("id", current.id)
      .select("*")
      .single()

    if (error) {
      console.error("Error updating store:", error)
      return { error: error.message }
    }

    return { store: data }
  }

  async deleteStore(slug: string): Promise<DeleteStoreResult> {
    const { data: current, error: fetchError } = await this.supabase
      .from("stores")
      .select("cover_image_url, logo_url")
      .eq("slug", slug)
      .single()

    if (fetchError || !current) {
      return { error: fetchError?.message ?? "Restaurante no encontrado." }
    }

    const { error } = await this.supabase
      .from("stores")
      .delete()
      .eq("slug", slug)

    if (error) {
      console.error("Error deleting store:", error)
      return { error: error.message }
    }

    return {}
  }

  async getStoreMenuBySlug(slug: string): Promise<{
    store: Store
    products: Product[]
    categoryOrder: string[]
  } | null> {
    const { data: store, error: storeError } = await this.supabase
      .from("stores")
      .select("*")
      .eq("slug", slug)
      .single()

    if (storeError || !store) {
      return null
    }

    const { data: products, error: productsError } = await this.supabase
      .from("products")
      .select("*")
      .eq("store_id", store.id)
      .order("menu_category", { ascending: true, nullsFirst: false })
      .order("position", { ascending: true })

    if (productsError) {
      console.error("Error fetching products:", productsError)
      return null
    }

    return {
      store,
      products: (products || []) as Product[],
      categoryOrder: parseCategoryOrder(store.menu_category_order),
    }
  }

  async saveMenuOrdering(
    storeId: string,
    payload: {
      categoryOrder: string[]
      productOrdering: { id: string; menu_category: string; position: number }[]
    }
  ): Promise<{ error?: string }> {
    const { categoryOrder, productOrdering } = payload

    const serializedOrder = categoryOrder.join(";")

    const { error: storeError } = await this.supabase
      .from("stores")
      .update({ menu_category_order: serializedOrder || null })
      .eq("id", storeId)

    if (storeError) {
      console.error("Error updating store menu order:", storeError)
      return { error: storeError.message }
    }

    for (const { id, menu_category, position } of productOrdering) {
      const { error: updateError } = await this.supabase
        .from("products")
        .update({ menu_category, position })
        .eq("id", id)

      if (updateError) {
        console.error("Error updating product ordering:", updateError)
        return { error: updateError.message }
      }
    }

    return {}
  }
}
