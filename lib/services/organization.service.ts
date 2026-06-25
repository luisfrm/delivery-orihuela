import type { SupabaseClient } from "@supabase/supabase-js"

import { createServiceRoleClient } from "@/lib/supabase/service-role"
import {
  deleteOrganizationLogo,
  uploadOrganizationLogo,
} from "@/lib/supabase/organization-storage"
import { validateImageFile } from "@/lib/file-validation"
import {
  DEFAULT_ORGANIZATION_SETTINGS,
  type OrganizationSettings,
  type UpdateOrganizationSettingsInput,
  type UpdateOrganizationSettingsResult,
} from "@/lib/types/organization"

const ORG_KEYS = [
  "org.name",
  "org.tagline",
  "org.logo_url",
  "org.logo_alt",
  "delivery_fee",
] as const
type OrgKey = (typeof ORG_KEYS)[number]

export class OrganizationService {
  constructor(private supabase: SupabaseClient) {}

  async getOrganizationSettings(): Promise<OrganizationSettings> {
    const { data, error } = await this.supabase
      .from("settings")
      .select("key, value")
      .in("key", ORG_KEYS as unknown as string[])

    if (error || !data) {
      console.error("[OrganizationService.getOrganizationSettings]", error?.message)
      return DEFAULT_ORGANIZATION_SETTINGS
    }

    const map = new Map<string, string>(
      data.map((row: { key: string; value: unknown }) => [
        row.key,
        typeof row.value === "string" ? row.value : String(row.value ?? ""),
      ])
    )

    const deliveryFeeRaw = map.get("delivery_fee")
    const deliveryFee = deliveryFeeRaw
      ? parseFloat(deliveryFeeRaw)
      : DEFAULT_ORGANIZATION_SETTINGS.deliveryFee

    return {
      name: map.get("org.name") || DEFAULT_ORGANIZATION_SETTINGS.name,
      tagline: map.get("org.tagline") || DEFAULT_ORGANIZATION_SETTINGS.tagline,
      logoUrl: map.get("org.logo_url") || DEFAULT_ORGANIZATION_SETTINGS.logoUrl,
      logoAlt: map.get("org.logo_alt") || DEFAULT_ORGANIZATION_SETTINGS.logoAlt,
      deliveryFee: Number.isFinite(deliveryFee)
        ? deliveryFee
        : DEFAULT_ORGANIZATION_SETTINGS.deliveryFee,
    }
  }

  async upsertOrgSetting(key: OrgKey, value: string): Promise<{ error?: string }> {
    const { error } = await this.supabase
      .from("settings")
      .upsert({ key, value, updated_at: new Date().toISOString() })

    if (error) {
      return { error: error.message }
    }
    return {}
  }
}

export async function updateOrganizationSettings(
  input: UpdateOrganizationSettingsInput
): Promise<UpdateOrganizationSettingsResult> {
  const name = input.name.trim()
  const tagline = input.tagline.trim()
  const logoAlt = input.logoAlt.trim()

  if (!name) return { error: "El nombre de la organización es requerido." }
  if (!tagline) return { error: "El eslogan es requerido." }
  if (!logoAlt) return { error: "El texto alternativo del logo es requerido." }

  // deliveryFee arrives in INTEGER CENTS (e.g. 600 = 6€). The form
  // does the euros → cents conversion before calling the action.
  if (!Number.isFinite(input.deliveryFee) || input.deliveryFee < 0 || input.deliveryFee > 10000) {
    return { error: "El costo de entrega debe estar entre 0 y 100€." }
  }
  if (!Number.isInteger(input.deliveryFee)) {
    return { error: "El costo de entrega debe ser un número entero (en centavos)." }
  }

  let nextLogoUrl = input.currentLogoUrl

  if (input.logoFile) {
    const validation = validateImageFile(input.logoFile)
    if (!validation.valid) {
      return { error: `Logo: ${validation.error}` }
    }

    const serviceSupabase = await createServiceRoleClient()
    const { url, error } = await uploadOrganizationLogo(serviceSupabase, input.logoFile)
    if (error || !url) {
      return { error: error ?? "Error al subir el logo." }
    }

    if (input.currentLogoUrl && input.currentLogoUrl !== url) {
      await deleteOrganizationLogo(serviceSupabase, input.currentLogoUrl)
    }

    nextLogoUrl = url
  }

  const userSupabase = await createServiceRoleClient()
  const service = new OrganizationService(userSupabase)

  const entries: Array<[OrgKey, string]> = [
    ["org.name", name],
    ["org.tagline", tagline],
    ["org.logo_alt", logoAlt],
    ["org.logo_url", nextLogoUrl],
    ["delivery_fee", String(input.deliveryFee)],
  ]

  for (const [key, value] of entries) {
    const { error } = await service.upsertOrgSetting(key, value)
    if (error) {
      return { error: `No se pudo guardar ${key}: ${error}` }
    }
  }

  return {
    settings: {
      name,
      tagline,
      logoAlt,
      logoUrl: nextLogoUrl,
      deliveryFee: input.deliveryFee,
    },
  }
}
