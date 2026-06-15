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
import { validateImageFile } from "@/lib/file-validation"
import { Store, StoreWithMetadata } from "@/lib/types"

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

export interface CreateStoreActionResult {
  store?: Store
  error?: string
}

export async function createStore(
  input: CreateStoreActionInput
): Promise<CreateStoreActionResult> {
  const {
    data: { user },
  } = await (await createClient()).auth.getUser()

  if (!user) {
    return { error: "No autenticado." }
  }

  const role = user.app_metadata?.role
  if (role !== "admin") {
    return { error: "No tienes permisos para crear restaurantes." }
  }

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
