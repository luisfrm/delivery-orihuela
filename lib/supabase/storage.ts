import type { SupabaseClient } from "@supabase/supabase-js"

const RESTAURANT_IMAGES_BUCKET = "Delivery Orihuela Bucket"

function getExtensionFromMimeType(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg"
    case "image/png":
      return "png"
    case "image/webp":
      return "webp"
    default:
      return "bin"
  }
}

export async function uploadRestaurantImage(
  supabase: SupabaseClient,
  file: File,
  folder: "cover" | "logo",
  storeId: string
): Promise<{ url?: string; path?: string; error?: string }> {
  const extension = getExtensionFromMimeType(file.type)
  const path = `${storeId}/${folder}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from(RESTAURANT_IMAGES_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    return { error: `Error al subir la imagen: ${uploadError.message}` }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(RESTAURANT_IMAGES_BUCKET).getPublicUrl(path)

  return { url: publicUrl, path }
}

export async function uploadProductImage(
  supabase: SupabaseClient,
  file: File,
  storeId: string,
  productId: string
): Promise<{ url?: string; path?: string; error?: string }> {
  const extension = getExtensionFromMimeType(file.type)
  const path = `${storeId}/products/${productId}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from(RESTAURANT_IMAGES_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    return { error: `Error al subir la imagen: ${uploadError.message}` }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(RESTAURANT_IMAGES_BUCKET).getPublicUrl(path)

  return { url: publicUrl, path }
}

export async function deleteStorageObjects(
  supabase: SupabaseClient,
  paths: string[]
): Promise<void> {
  if (paths.length === 0) return

  await supabase.storage.from(RESTAURANT_IMAGES_BUCKET).remove(paths)
}
