/**
 * Format helpers for menu prices.
 *
 * Prices are stored in the database as integer cents (100 = 1€).
 * Display uses Intl.NumberFormat with the es-ES locale.
 */

export function formatPriceCents(cents: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100)
}

/**
 * Parses a user-entered euro value (e.g. "1.50" or "1,50") to integer cents.
 * Returns 0 for empty strings, NaN for invalid input.
 */
export function parsePriceEurosToCents(value: string): number {
  if (!value || !value.trim()) return 0
  const normalized = value.replace(",", ".").trim()
  const parsed = Number.parseFloat(normalized)
  if (Number.isNaN(parsed)) return Number.NaN
  return Math.round(parsed * 100)
}
