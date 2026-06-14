import { UserAddress } from "@/lib/types"

export interface CreateAddressParams {
  name: string
  addressLine: string
  city?: string
  setAsDefault?: boolean
}

export interface AddressResult {
  success?: boolean
  error?: string
}

export class AddressesService {
  constructor(private supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>) {}

  async getUserAddresses(userId: string): Promise<UserAddress[]> {
    const { data, error } = await this.supabase
      .from("user_addresses")
      .select("*")
      .eq("user_id", userId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching addresses:", error)
      return []
    }

    return data || []
  }

  async createAddress(userId: string, params: CreateAddressParams): Promise<AddressResult> {
    if (params.setAsDefault) {
      await this.supabase
        .from("user_addresses")
        .update({ is_default: false })
        .eq("user_id", userId)
    }

    const { error } = await this.supabase.from("user_addresses").insert({
      user_id: userId,
      name: params.name,
      address_line: params.addressLine,
      city: params.city ?? "Orihuela",
      is_default: params.setAsDefault ?? false,
    })

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  }
}