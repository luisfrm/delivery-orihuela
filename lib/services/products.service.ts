import type { Product } from "@/lib/types"

type SupabaseClient = Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>

export interface CreateProductParams {
  id: string
  storeId: string
  name: string
  description: string | null
  pictureUrl: string | null
  estimatedPrice: number
  isActive: boolean
  menuCategory: string
}

export interface UpdateProductParams {
  name: string
  description: string | null
  pictureUrl: string | null
  estimatedPrice: number
  isActive: boolean
}

export interface DeleteProductResult {
  pictureUrl: string | null
  error?: string
}

export class ProductsService {
  constructor(private supabase: SupabaseClient) {}

  async createProduct(params: CreateProductParams): Promise<{ product?: Product; error?: string }> {
    const { data: lastProduct, error: lastError } = await this.supabase
      .from("products")
      .select("position")
      .eq("store_id", params.storeId)
      .eq("menu_category", params.menuCategory)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (lastError) {
      console.error("Error computing next position:", lastError)
      return { error: lastError.message }
    }

    const nextPosition = (lastProduct?.position ?? -1) + 1

    const { data, error } = await this.supabase
      .from("products")
      .insert({
        id: params.id,
        store_id: params.storeId,
        name: params.name,
        description: params.description,
        picture_url: params.pictureUrl,
        estimated_price: params.estimatedPrice,
        is_active: params.isActive,
        menu_category: params.menuCategory,
        position: nextPosition,
      })
      .select("*")
      .single()

    if (error) {
      console.error("Error creating product:", error)
      return { error: error.message }
    }

    return { product: data as Product }
  }

  async updateProduct(
    productId: string,
    params: UpdateProductParams
  ): Promise<{ product?: Product; error?: string }> {
    const { data, error } = await this.supabase
      .from("products")
      .update({
        name: params.name,
        description: params.description,
        picture_url: params.pictureUrl,
        estimated_price: params.estimatedPrice,
        is_active: params.isActive,
      })
      .eq("id", productId)
      .select("*")
      .single()

    if (error) {
      console.error("Error updating product:", error)
      return { error: error.message }
    }

    return { product: data as Product }
  }

  async deleteProduct(productId: string): Promise<DeleteProductResult> {
    const { data: current, error: fetchError } = await this.supabase
      .from("products")
      .select("picture_url")
      .eq("id", productId)
      .maybeSingle()

    if (fetchError) {
      console.error("Error fetching product before delete:", fetchError)
      return { pictureUrl: null, error: fetchError.message }
    }

    if (!current) {
      return { pictureUrl: null, error: "Plato no encontrado." }
    }

    const { error } = await this.supabase
      .from("products")
      .delete()
      .eq("id", productId)

    if (error) {
      console.error("Error deleting product:", error)
      return { pictureUrl: current.picture_url, error: error.message }
    }

    return { pictureUrl: current.picture_url }
  }
}
