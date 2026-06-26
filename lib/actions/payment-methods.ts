"use server"

import { createClient } from "@/lib/supabase/server"
import { PaymentMethodsService } from "@/lib/services/payment-methods.service"
import {
  validatePaymentMethodInput,
  type PaymentMethod,
  type PaymentMethodInput,
  type PaymentMethodFieldDefinition,
} from "@/lib/types/payment-methods"

async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { ok: false as const, error: "No autenticado." }
  }
  if (user.app_metadata?.role !== "admin") {
    return { ok: false as const, error: "No tienes permisos de administrador." }
  }
  return { ok: true as const }
}

export async function getPaymentMethodsAction(): Promise<PaymentMethod[]> {
  const supabase = await createClient()
  const service = new PaymentMethodsService(supabase)
  return service.getPaymentMethods()
}

export interface CreatePaymentMethodActionInput {
  name: string
  fields: PaymentMethodFieldDefinition[]
  isActive: boolean
}

export interface PaymentMethodActionResult {
  paymentMethod?: PaymentMethod
  error?: string
}

export async function createPaymentMethodAction(
  input: CreatePaymentMethodActionInput
): Promise<PaymentMethodActionResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  const paymentInput: PaymentMethodInput = {
    name: input.name,
    fields: input.fields,
    isActive: input.isActive,
  }
  const validation = validatePaymentMethodInput(paymentInput)
  if (validation) {
    return { error: validation.message }
  }

  const supabase = await createClient()
  const service = new PaymentMethodsService(supabase)
  return service.createPaymentMethod(paymentInput)
}

export interface UpdatePaymentMethodActionInput {
  name?: string
  fields?: PaymentMethodFieldDefinition[]
  isActive?: boolean
}

export async function updatePaymentMethodAction(
  id: string,
  input: UpdatePaymentMethodActionInput
): Promise<PaymentMethodActionResult> {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  if (input.name !== undefined || input.fields !== undefined || input.isActive !== undefined) {
    const paymentInput: PaymentMethodInput = {
      name: input.name ?? "",
      fields: input.fields ?? [],
      isActive: input.isActive ?? true,
    }
    const validation = validatePaymentMethodInput(paymentInput)
    if (validation) {
      return { error: validation.message }
    }
  }

  const supabase = await createClient()
  const service = new PaymentMethodsService(supabase)
  return service.updatePaymentMethod(id, input)
}

export async function deletePaymentMethodAction(
  id: string
): Promise<{ error?: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  const supabase = await createClient()
  const service = new PaymentMethodsService(supabase)
  return service.deletePaymentMethod(id)
}

export async function updatePaymentMethodsOrderAction(
  orderedIds: string[]
): Promise<{ error?: string }> {
  const auth = await requireAdmin()
  if (!auth.ok) return { error: auth.error }

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return { error: "Lista de IDs inválida" }
  }

  const supabase = await createClient()
  const service = new PaymentMethodsService(supabase)
  return service.reorderPaymentMethods(orderedIds)
}
