"use server"

import { createClient } from "@/lib/supabase/server"
import {
  OrganizationService,
  updateOrganizationSettings,
} from "@/lib/services/organization.service"
import type {
  OrganizationSettings,
  UpdateOrganizationSettingsInput,
  UpdateOrganizationSettingsResult,
} from "@/lib/types/organization"

export async function getOrganizationSettings(): Promise<OrganizationSettings> {
  const supabase = await createClient()
  const service = new OrganizationService(supabase)
  return service.getOrganizationSettings()
}

export async function updateOrganizationSettingsAction(
  input: UpdateOrganizationSettingsInput
): Promise<UpdateOrganizationSettingsResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "No autenticado." }
  }

  const role = user.app_metadata?.role
  if (role !== "admin") {
    return { error: "No tienes permisos para modificar la configuración." }
  }

  return updateOrganizationSettings(input)
}
