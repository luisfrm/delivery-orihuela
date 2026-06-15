import { TopAppBar } from "@/components/layout/TopAppBar"
import { BottomNav } from "@/components/layout/BottomNav"
import { getOrganizationSettings } from "@/lib/actions/organization"

export const dynamic = "force-dynamic"

export default async function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const orgSettings = await getOrganizationSettings()

  return (
    <>
      <TopAppBar orgSettings={orgSettings} />
      <main className="w-full flex flex-col gap-[24px] pb-[180px] pt-[72px]">
        {children}
      </main>
      <BottomNav />
    </>
  )
}
