export const MAX_IMAGE_SIZE = 512 * 1024 // 512 KB
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const
export const ACCEPTED_IMAGE_EXTENSIONS = ".jpg,.jpeg,.png,.webp"

export type AcceptedImageType = (typeof ACCEPTED_IMAGE_TYPES)[number]

export interface FileValidationResult {
  valid: boolean
  error?: string
}

export function validateImageFile(file: File): FileValidationResult {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return {
      valid: false,
      error: "Formato no permitido. Usa JPG, PNG o WebP.",
    }
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `La imagen es demasiado grande. Máximo ${formatFileSize(MAX_IMAGE_SIZE)}.`,
    }
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: "El archivo está vacío.",
    }
  }

  return { valid: true }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
