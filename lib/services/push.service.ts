import webPush, { SendResult } from "web-push"
import { createServiceRoleClient } from "@/lib/supabase/service-role"

if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT) {
  webPush.setVapidDetails(
    process.env.VAPID_SUBJECT,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )
} else {
  console.warn("VAPID keys not configured in environment variables.")
}

export interface NotificationPayload {
  title: string
  body: string
  url?: string
}

export class PushService {
  private supabase = createServiceRoleClient()

  async sendToUser(userId: string, payload: NotificationPayload): Promise<void> {
    try {
      const { data: subscriptions, error } = await this.supabase
        .from("push_subscriptions")
        .select("*")
        .eq("user_id", userId)

      if (error) {
        console.error(`[PushService] DB error fetching subscriptions for user ${userId}:`, error)
        return
      }

      if (!subscriptions || subscriptions.length === 0) return

      await this.sendToSubscriptions(subscriptions, payload)
    } catch (error) {
      console.error(`[PushService] Error sending to user ${userId}:`, error)
    }
  }

  async sendToRole(role: string, payload: NotificationPayload): Promise<void> {
    try {
      // 1. Get all users
      const { data: authList } = await this.supabase.auth.admin.listUsers({
        perPage: 1000,
      })
      const users = authList?.users || []

      // 2. Filter by role
      const roleUsers = users.filter((u) => u.app_metadata?.role === role)
      if (roleUsers.length === 0) return
      
      const userIds = roleUsers.map((u) => u.id)

      // 3. Get all subscriptions for these users
      const { data: subscriptions } = await this.supabase
        .from("push_subscriptions")
        .select("*")
        .in("user_id", userIds)

      if (!subscriptions || subscriptions.length === 0) return

      await this.sendToSubscriptions(subscriptions, payload)
    } catch (error) {
      console.error(`[PushService] Error sending to role ${role}:`, error)
    }
  }

  private async sendToSubscriptions(subscriptions: any[], payload: NotificationPayload): Promise<void> {
    const notifications = subscriptions.map((sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      }

      return webPush
        .sendNotification(pushSubscription, JSON.stringify(payload))
        .catch(async (err) => {
          if (err.statusCode === 410 || err.statusCode === 404) {
            // Subscription has expired or is no longer valid
            console.log(`[PushService] Removing expired subscription for endpoint: ${sub.endpoint}`)
            await this.supabase
              .from("push_subscriptions")
              .delete()
              .eq("endpoint", sub.endpoint)
          } else {
            console.error("[PushService] Error sending notification:", err)
          }
        })
    })

    await Promise.allSettled(notifications)
  }
}
