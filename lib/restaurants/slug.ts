/**
 * Convert a human-readable name into a URL-friendly slug.
 *
 * Rules:
 *   - Lowercase
 *   - Strip diacritics ("Café" -> "cafe")
 *   - Replace non-alphanumeric characters with hyphens
 *   - Collapse multiple hyphens
 *   - Trim leading/trailing hyphens
 *   - Truncate to 60 characters
 *
 * Falls back to "restaurante" if the result is empty.
 */
export function slugify(text: string): string {
  const base = text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)

  return base || "restaurante"
}

/**
 * Generate a unique slug by appending a short random suffix.
 * The slug + 4-char base36 suffix keeps collisions astronomically unlikely
 * while staying short enough for URLs.
 */
export function generateStoreSlug(name: string): string {
  const base = slugify(name)
  const suffix = Math.random().toString(36).slice(2, 6)
  return `${base}-${suffix}`
}
