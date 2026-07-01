import type { SupabaseClient } from "@supabase/supabase-js"

import { ORGANIZATION_ASSETS_BUCKET } from "@/lib/supabase/organization-storage"

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

/**
 * Construye el path de storage para una imagen de payment
 * method. Path: `payments/{methodId}/{uploadToken}-{fieldId}.{ext}`
 *
 * - `methodId` agrupa por método (legible para el admin al
 *   navegar el bucket).
 * - `uploadToken` es un UUID v4 generado en el cliente al
 *   inicio del paso de payment. Es independiente de la order,
 *   lo que permite subir la imagen ANTES de crear la order.
 * - `fieldId` diferencia los campos dentro del mismo payment.
 */
export function buildPaymentMethodImagePath(
  methodId: string,
  uploadToken: string,
  fieldId: string,
  extension: string
): string {
  return `payments/${methodId}/${uploadToken}-${fieldId}.${extension}`
}

/**
 * Sube una imagen de payment method al bucket
 * `organization-assets`. Usa `upsert: true` para que un re-upload
 * sobrescriba el archivo (path determinístico).
 *
 * Pensada para ser llamada desde el cliente usando el
 * browser client (`lib/supabase/client.ts`). La RLS del bucket
 * permite INSERT a cualquier usuario autenticado.
 */
export async function uploadPaymentMethodImage(
  supabase: SupabaseClient,
  methodId: string,
  uploadToken: string,
  fieldId: string,
  file: File
): Promise<{ url?: string; path?: string; error?: string }> {
  const extension = getExtensionFromMimeType(file.type)
  const path = buildPaymentMethodImagePath(methodId, uploadToken, fieldId, extension)

  const { error: uploadError } = await supabase.storage
    .from(ORGANIZATION_ASSETS_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    return { error: `Error al subir la imagen: ${uploadError.message}` }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(ORGANIZATION_ASSETS_BUCKET).getPublicUrl(path)

  return { url: publicUrl, path }
}
