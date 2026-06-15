"use server"

import { randomUUID } from "crypto"

import { createClient } from "@/lib/supabase/server"
import { createServiceRoleClient } from "@/lib/supabase/service-role"
import {
  deleteRestaurantImages,
  uploadRestaurantImage,
} from "@/lib/supabase/storage"
import { StoresService } from "@/lib/services/stores.service"
import { serializeCategoryIds } from "@/lib/restaurants/categories"
import { serializeCategoryOrder } from "@/lib/restaurants/menu-categories"
import { validateImageFile } from "@/lib/file-validation"
import { Product, Store, StoreWithMetadata } from "@/lib/types"

export async function getStores(): Promise<Store[]> {
  const supabase = await createClient()
  const service = new StoresService(supabase)
  return service.getStores()
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  const supabase = await createClient()
  const service = new StoresService(supabase)
  return service.getStoreBySlug(slug)
}

export async function getAdminStores(): Promise<StoreWithMetadata[]> {
  const supabase = await createClient()
  const service = new StoresService(supabase)
  return service.getStoresWithMetadata()
}

export interface CreateStoreActionInput {
  name: string
  address: string
  phone: string
  description: string | null
  categoryIds: string[]
  coverFile: File | null
  logoFile: File | null
}

export interface UpdateStoreActionInput {
  name: string
  address: string
  phone: string
  description: string | null
  categoryIds: string[]
  coverFile: File | null
  logoFile: File | null
}

export interface CreateStoreActionResult {
  store?: Store
  error?: string
}

export interface UpdateStoreActionResult {
  store?: Store
  error?: string
  newSlug?: string
}

export interface DeleteStoreActionResult {
  error?: string
}

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

export async function createStore(
  input: CreateStoreActionInput
): Promise<CreateStoreActionResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  if (input.coverFile) {
    const validation = validateImageFile(input.coverFile)
    if (!validation.valid) {
      return { error: `Portada: ${validation.error}` }
    }
  }
  if (input.logoFile) {
    const validation = validateImageFile(input.logoFile)
    if (!validation.valid) {
      return { error: `Logo: ${validation.error}` }
    }
  }

  const folderId = randomUUID()
  const serviceSupabase = await createServiceRoleClient()

  const uploadedPaths: string[] = []

  let coverImageUrl: string | null = null
  if (input.coverFile) {
    const { url, path, error } = await uploadRestaurantImage(
      serviceSupabase,
      input.coverFile,
      "cover",
      folderId
    )
    if (error || !url || !path) {
      await deleteRestaurantImages(serviceSupabase, uploadedPaths)
      return { error: error ?? "Error al subir la imagen de portada." }
    }
    coverImageUrl = url
    uploadedPaths.push(path)
  }

  let logoImageUrl: string | null = null
  if (input.logoFile) {
    const { url, path, error } = await uploadRestaurantImage(
      serviceSupabase,
      input.logoFile,
      "logo",
      folderId
    )
    if (error || !url || !path) {
      await deleteRestaurantImages(serviceSupabase, uploadedPaths)
      return { error: error ?? "Error al subir el logo." }
    }
    logoImageUrl = url
    uploadedPaths.push(path)
  }

  const userSupabase = await createClient()
  const service = new StoresService(userSupabase)

  const result = await service.createStore({
    name: input.name,
    address: input.address,
    phone: input.phone,
    description: input.description,
    categoryIds: serializeCategoryIds(input.categoryIds).split(";").filter(Boolean),
    coverImageUrl,
    logoImageUrl,
  })

  if (result.error) {
    await deleteRestaurantImages(serviceSupabase, uploadedPaths)
    return { error: result.error }
  }

  return { store: result.store }
}

export async function updateStore(
  slug: string,
  input: UpdateStoreActionInput
): Promise<UpdateStoreActionResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  if (input.coverFile) {
    const validation = validateImageFile(input.coverFile)
    if (!validation.valid) {
      return { error: `Portada: ${validation.error}` }
    }
  }
  if (input.logoFile) {
    const validation = validateImageFile(input.logoFile)
    if (!validation.valid) {
      return { error: `Logo: ${validation.error}` }
    }
  }

  const userSupabase = await createClient()
  const service = new StoresService(userSupabase)

  const current = await service.getStoreBySlug(slug)
  if (!current) {
    return { error: "Restaurante no encontrado." }
  }

  const serviceSupabase = await createServiceRoleClient()
  const uploadedPaths: string[] = []
  const oldPaths: string[] = []

  let coverImageUrl = current.cover_image_url
  if (input.coverFile) {
    const { url, path, error } = await uploadRestaurantImage(
      serviceSupabase,
      input.coverFile,
      "cover",
      current.id
    )
    if (error || !url || !path) {
      await deleteRestaurantImages(serviceSupabase, uploadedPaths)
      return { error: error ?? "Error al subir la imagen de portada." }
    }
    coverImageUrl = url
    uploadedPaths.push(path)
    if (url !== current.cover_image_url) {
      const oldCoverPath = extractStoragePath(current.cover_image_url)
      if (oldCoverPath) oldPaths.push(oldCoverPath)
    }
  }

  let logoImageUrl = current.logo_url
  if (input.logoFile) {
    const { url, path, error } = await uploadRestaurantImage(
      serviceSupabase,
      input.logoFile,
      "logo",
      current.id
    )
    if (error || !url || !path) {
      await deleteRestaurantImages(serviceSupabase, uploadedPaths)
      return { error: error ?? "Error al subir el logo." }
    }
    logoImageUrl = url
    uploadedPaths.push(path)
    if (url !== current.logo_url) {
      const oldLogoPath = extractStoragePath(current.logo_url)
      if (oldLogoPath) oldPaths.push(oldLogoPath)
    }
  }

  const result = await service.updateStore(slug, {
    name: input.name,
    address: input.address,
    phone: input.phone,
    description: input.description,
    categoryIds: serializeCategoryIds(input.categoryIds).split(";").filter(Boolean),
    coverImageUrl,
    logoImageUrl,
  })

  if (result.error) {
    await deleteRestaurantImages(serviceSupabase, uploadedPaths)
    return { error: result.error }
  }

  if (oldPaths.length > 0) {
    await deleteRestaurantImages(serviceSupabase, oldPaths)
  }

  return { store: result.store, newSlug: result.store?.slug }
}

export async function deleteStore(slug: string): Promise<DeleteStoreActionResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  const userSupabase = await createClient()
  const service = new StoresService(userSupabase)

  const current = await service.getStoreBySlug(slug)
  if (!current) {
    return { error: "Restaurante no encontrado." }
  }

  const serviceSupabase = await createServiceRoleClient()

  const result = await service.deleteStore(slug)
  if (result.error) {
    return { error: result.error }
  }

  const oldPaths: string[] = []
  const coverPath = extractStoragePath(current.cover_image_url)
  if (coverPath) oldPaths.push(coverPath)
  const logoPath = extractStoragePath(current.logo_url)
  if (logoPath) oldPaths.push(logoPath)

  if (oldPaths.length > 0) {
    await deleteRestaurantImages(serviceSupabase, oldPaths)
  }

  return {}
}

export interface StoreMenuData {
  store: Store
  products: Product[]
  categoryOrder: string[]
}

export async function getStoreMenuBySlug(slug: string): Promise<StoreMenuData | null> {
  const supabase = await createClient()
  const service = new StoresService(supabase)
  return service.getStoreMenuBySlug(slug)
}

export interface SaveMenuPayload {
  categoryOrder: string[]
  products: Product[]
  deletedProductIds: string[]
}

export interface SaveMenuResult {
  error?: string
}

export async function saveMenu(
  storeId: string,
  payload: SaveMenuPayload
): Promise<SaveMenuResult> {
  const {
    data: { user },
  } = await (await createClient()).auth.getUser()

  if (!user) {
    return { error: "No autenticado." }
  }

  const role = user.app_metadata?.role
  if (role !== "admin") {
    return { error: "No tienes permisos para guardar el menú." }
  }

  const supabase = await createClient()
  const service = new StoresService(supabase)

  return service.saveMenu(storeId, {
    categoryOrder: serializeCategoryOrder(payload.categoryOrder).split(";").filter(Boolean),
    products: payload.products,
    deletedProductIds: payload.deletedProductIds,
  })
}
