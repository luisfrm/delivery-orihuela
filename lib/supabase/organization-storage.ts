import type { SupabaseClient } from "@supabase/supabase-js"

export const ORGANIZATION_ASSETS_BUCKET = "organization-assets"
export const ORGANIZATION_LOGO_PATH = "org/logo"

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

export async function uploadOrganizationLogo(
  supabase: SupabaseClient,
  file: File
): Promise<{ url?: string; path?: string; error?: string }> {
  const extension = getExtensionFromMimeType(file.type)
  const path = `${ORGANIZATION_LOGO_PATH}.${extension}`

  const { error: uploadError } = await supabase.storage
    .from(ORGANIZATION_ASSETS_BUCKET)
    .upload(path, file, {
      contentType: file.type,
      upsert: true,
    })

  if (uploadError) {
    return { error: `Error al subir el logo: ${uploadError.message}` }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(ORGANIZATION_ASSETS_BUCKET).getPublicUrl(path)

  return { url: publicUrl, path }
}

export async function deleteOrganizationLogo(
  supabase: SupabaseClient,
  previousUrl: string
): Promise<void> {
  if (!previousUrl) return
  if (!previousUrl.includes(ORGANIZATION_ASSETS_BUCKET)) return

  const marker = `${ORGANIZATION_ASSETS_BUCKET}/`
  const idx = previousUrl.indexOf(marker)
  if (idx === -1) return

  const path = previousUrl.slice(idx + marker.length).split("?")[0]
  if (!path) return

  await supabase.storage.from(ORGANIZATION_ASSETS_BUCKET).remove([path])
}
