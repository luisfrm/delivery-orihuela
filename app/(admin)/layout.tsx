import { getOrganizationSettings } from "@/lib/actions/organization"
import { AdminShell } from "./_components/AdminShell"

export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const orgSettings = await getOrganizationSettings()
  return <AdminShell orgSettings={orgSettings}>{children}</AdminShell>
}
