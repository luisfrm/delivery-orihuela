"use server"

import { createClient } from "@/lib/supabase/server"

export async function subscribeUser(
  subscription: PushSubscriptionJSON
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  if (!subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    return { error: "Suscripción inválida" }
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert({
      user_id: user.id,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    }, { onConflict: "endpoint" })

  if (error) {
    console.error("[push] Error saving subscription:", error)
    return { error: "Error al guardar suscripción" }
  }

  return { success: true }
}

export async function unsubscribeUser(
  endpoint: string
): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Usuario no autenticado" }
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_id", user.id)
    .eq("endpoint", endpoint)

  if (error) {
    console.error("[push] Error deleting subscription:", error)
    return { error: "Error al eliminar suscripción" }
  }

  return { success: true }
}
