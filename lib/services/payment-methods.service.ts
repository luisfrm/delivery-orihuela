import type { SupabaseClient } from "@supabase/supabase-js"

import {
  parsePaymentMethodRow,
  type PaymentMethod,
  type PaymentMethodInput,
  type PaymentMethodRow,
} from "@/lib/types/payment-methods"

export interface CreatePaymentMethodParams extends PaymentMethodInput {
  position?: number
}

export interface UpdatePaymentMethodParams extends Partial<PaymentMethodInput> {
  position?: number
}

export interface PaymentMethodResult {
  paymentMethod?: PaymentMethod
  error?: string
}

export class PaymentMethodsService {
  constructor(private supabase: SupabaseClient) {}

  async getPaymentMethods(includeInactive = true): Promise<PaymentMethod[]> {
    let query = this.supabase
      .from("payment_methods")
      .select("*")
      .order("position", { ascending: true })
      .order("created_at", { ascending: true })

    if (!includeInactive) {
      query = query.eq("is_active", true)
    }

    const { data, error } = await query
    if (error) {
      console.error("[PaymentMethodsService.getPaymentMethods]", error.message)
      return []
    }
    return ((data ?? []) as PaymentMethodRow[]).map(parsePaymentMethodRow)
  }

  async getPaymentMethodById(id: string): Promise<PaymentMethod | null> {
    const { data, error } = await this.supabase
      .from("payment_methods")
      .select("*")
      .eq("id", id)
      .single()

    if (error || !data) {
      return null
    }
    return parsePaymentMethodRow(data as PaymentMethodRow)
  }

  async createPaymentMethod(
    params: CreatePaymentMethodParams
  ): Promise<PaymentMethodResult> {
    const { data, error } = await this.supabase
      .from("payment_methods")
      .insert({
        name: params.name.trim(),
        fields: params.fields,
        is_active: params.isActive,
        position: params.position ?? 0,
      })
      .select("*")
      .single()

    if (error) {
      console.error("[PaymentMethodsService.createPaymentMethod]", error.message)
      return { error: error.message }
    }

    return { paymentMethod: parsePaymentMethodRow(data as PaymentMethodRow) }
  }

  async updatePaymentMethod(
    id: string,
    params: UpdatePaymentMethodParams
  ): Promise<PaymentMethodResult> {
    const update: Record<string, unknown> = {}
    if (params.name !== undefined) update.name = params.name.trim()
    if (params.fields !== undefined) update.fields = params.fields
    if (params.isActive !== undefined) update.is_active = params.isActive
    if (params.position !== undefined) update.position = params.position
    update.updated_at = new Date().toISOString()

    const { data, error } = await this.supabase
      .from("payment_methods")
      .update(update)
      .eq("id", id)
      .select("*")
      .single()

    if (error) {
      console.error("[PaymentMethodsService.updatePaymentMethod]", error.message)
      return { error: error.message }
    }

    return { paymentMethod: parsePaymentMethodRow(data as PaymentMethodRow) }
  }

  async deletePaymentMethod(id: string): Promise<{ error?: string }> {
    const { error } = await this.supabase
      .from("payment_methods")
      .delete()
      .eq("id", id)

    if (error) {
      console.error("[PaymentMethodsService.deletePaymentMethod]", error.message)
      return { error: error.message }
    }

    return {}
  }

  /**
   * Persiste un nuevo orden para los métodos de pago. Asigna
   * `position = index` a cada id en el array.
   * Si la operación parcial falla, los updates previos quedan
   * (no hay transacción); el caller debe reconciliar después.
   */
  async reorderPaymentMethods(
    orderedIds: string[]
  ): Promise<{ error?: string }> {
    for (let i = 0; i < orderedIds.length; i++) {
      const { error } = await this.supabase
        .from("payment_methods")
        .update({ position: i, updated_at: new Date().toISOString() })
        .eq("id", orderedIds[i])

      if (error) {
        console.error(
          "[PaymentMethodsService.reorderPaymentMethods]",
          error.message
        )
        return { error: error.message }
      }
    }
    return {}
  }
}
