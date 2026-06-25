export class SettingsService {
  constructor(private supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>) {}

  async getSetting(key: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from("settings")
      .select("value")
      .eq("key", key)
      .single()

    if (error || !data) {
      return null
    }

    return data.value as string
  }

  /**
   * Returns the configured delivery fee in INTEGER CENTS (e.g. 600 = 6€).
   * The DB stores the raw value as cents to stay consistent with the rest
   * of the order amounts (orders.delivery_fee, etc.).
   */
  async getDeliveryFee(): Promise<number> {
    const fee = await this.getSetting("delivery_fee")
    return fee ? parseFloat(fee) : 600
  }
}