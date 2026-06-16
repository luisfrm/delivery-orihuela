"use server"

import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import {
  deleteStorageObjects,
  uploadProductImage,
} from "@/lib/supabase/storage"
import { validateImageFile } from "@/lib/file-validation"
import { ProductsService } from "@/lib/services/products.service"
import type { Product } from "@/lib/types"

async function requireAdmin() {
  const {
    data: { user },
  } = await (await createClient()).auth.getUser()
  if (!user) return { ok: false as const, error: "No autenticado." }
  if (user.app_metadata?.role !== "admin") {
    return { ok: false as const, error: "No tienes permisos." }
  }
  return { ok: true as const }
}

function extractStoragePath(url: string | null | undefined): string | null {
  if (!url) return null
  const marker = "/storage/v1/object/public/Delivery%20Orihuela%20Bucket/"
  const markerRaw = "/storage/v1/object/public/Delivery Orihuela Bucket/"
  const idx = url.indexOf(marker)
  if (idx === -1) {
    const idxRaw = url.indexOf(markerRaw)
    if (idxRaw === -1) return null
    return decodeURIComponent(url.slice(idxRaw + markerRaw.length))
  }
  return decodeURIComponent(url.slice(idx + marker.length))
}

export interface CreateProductInput {
  id: string
  storeId: string
  name: string
  description: string | null
  pictureUrl: string | null
  estimatedPrice: number
  isActive: boolean
  menuCategory: string
}

export interface CreateProductResult {
  product?: Product
  error?: string
}

export async function createProductAction(
  input: CreateProductInput
): Promise<CreateProductResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  const supabase = await createClient()
  const service = new ProductsService(supabase)

  return service.createProduct(input)
}

export interface UpdateProductInput {
  name: string
  description: string | null
  pictureUrl: string | null
  estimatedPrice: number
  isActive: boolean
}

export interface UpdateProductResult {
  product?: Product
  error?: string
}

export async function updateProductAction(
  productId: string,
  input: UpdateProductInput
): Promise<UpdateProductResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  const supabase = await createClient()
  const service = new ProductsService(supabase)

  return service.updateProduct(productId, input)
}

export interface DeleteProductResult {
  pictureUrl: string | null
  error?: string
}

export async function deleteProductAction(
  productId: string
): Promise<DeleteProductResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return { pictureUrl: null, error: auth.error }

  const supabase = await createClient()
  const service = new ProductsService(supabase)

  return service.deleteProduct(productId)
}

export interface UploadProductImageResult {
  url?: string
  error?: string
}

export async function uploadProductImageAction(
  storeId: string,
  productId: string,
  file: File
): Promise<UploadProductImageResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  const validation = validateImageFile(file)
  if (!validation.valid) {
    return { error: validation.error }
  }

  const serviceSupabase = await createServiceRoleClient()

  const { url, path, error } = await uploadProductImage(
    serviceSupabase,
    file,
    storeId,
    productId
  )

  if (error || !url || !path) {
    return { error: error ?? "Error al subir la imagen del plato." }
  }

  return { url }
}

export interface DeleteProductImageResult {
  error?: string
}

export async function deleteProductImageAction(
  pictureUrl: string
): Promise<DeleteProductImageResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  const path = extractStoragePath(pictureUrl)
  if (!path) return {}

  const serviceSupabase = await createServiceRoleClient()
  await deleteStorageObjects(serviceSupabase, [path])

  return {}
}
