export interface OrganizationSettings {
  name: string
  tagline: string
  logoUrl: string
  logoAlt: string
}

export const DEFAULT_ORGANIZATION_SETTINGS: OrganizationSettings = {
  name: "Orihuela",
  tagline: "Delivery",
  logoUrl: "/assets/logo.webp",
  logoAlt: "Los Latinos Logo",
}

export interface UpdateOrganizationSettingsInput {
  name: string
  tagline: string
  logoAlt: string
  logoFile: File | null
  currentLogoUrl: string
}

export interface UpdateOrganizationSettingsResult {
  error?: string
  settings?: OrganizationSettings
}
