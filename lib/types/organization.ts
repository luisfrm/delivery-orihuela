export interface OrganizationSettings {
  name: string
  tagline: string
  logoUrl: string
  logoAlt: string
  deliveryFee: number
}

export const DEFAULT_ORGANIZATION_SETTINGS: OrganizationSettings = {
  name: "Orihuela",
  tagline: "Delivery",
  logoUrl: "/assets/logo.webp",
  logoAlt: "Los Latinos Logo",
  deliveryFee: 4,
}

export interface UpdateOrganizationSettingsInput {
  name: string
  tagline: string
  logoAlt: string
  logoFile: File | null
  currentLogoUrl: string
  deliveryFee: number
}

export interface UpdateOrganizationSettingsResult {
  error?: string
  settings?: OrganizationSettings
}
