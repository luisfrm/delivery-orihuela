/**
 * `deliveryFee` is stored as INTEGER CENTS (e.g. 600 = 6€). The form
 * converts to/from euros at the boundary; the rest of the system
 * (orders.delivery_fee, order_items.estimated_unit_price, products.
 * estimated_price) all use cents.
 */
export interface OrganizationSettings {
  name: string
  tagline: string
  logoUrl: string
  logoAlt: string
  /** Delivery fee in integer cents. 600 = 6€. */
  deliveryFee: number
}

export const DEFAULT_ORGANIZATION_SETTINGS: OrganizationSettings = {
  name: "Orihuela",
  tagline: "Delivery",
  logoUrl: "/assets/logo.webp",
  logoAlt: "Los Latinos Logo",
  deliveryFee: 600,
}

export interface UpdateOrganizationSettingsInput {
  name: string
  tagline: string
  logoAlt: string
  logoFile: File | null
  currentLogoUrl: string
  /** Delivery fee in integer cents. 600 = 6€. */
  deliveryFee: number
}

export interface UpdateOrganizationSettingsResult {
  error?: string
  settings?: OrganizationSettings
}
