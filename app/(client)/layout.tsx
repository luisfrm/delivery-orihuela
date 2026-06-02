import { TopAppBar } from "@/components/layout/TopAppBar"
import { BottomNav } from "@/components/layout/BottomNav"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <TopAppBar />
      <main className="w-full flex flex-col gap-[24px]">
        {children}
      </main>
      <BottomNav />
    </>
  )
}