"use client"

import { useState, type ReactNode } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Settings as SettingsIcon, CreditCard } from "lucide-react"

export type SettingsTab = "general" | "payments"

interface SettingsTabsProps {
  generalContent: ReactNode
  paymentsContent: ReactNode
  defaultTab?: SettingsTab
}

const TAB_LABELS: Record<SettingsTab, string> = {
  general: "General",
  payments: "Pagos",
}

export function SettingsTabs({
  generalContent,
  paymentsContent,
  defaultTab = "general",
}: SettingsTabsProps) {
  const [tab, setTab] = useState<SettingsTab>(defaultTab)

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setTab(value as SettingsTab)}
      orientation="horizontal"
    >
      <TabsList variant="line" className="self-start">
        <TabsTrigger value="general" className="gap-1.5">
          <SettingsIcon className="size-4" />
          {TAB_LABELS.general}
        </TabsTrigger>
        <TabsTrigger value="payments" className="gap-1.5">
          <CreditCard className="size-4" />
          {TAB_LABELS.payments}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="general" className="mt-6">
        {generalContent}
      </TabsContent>
      <TabsContent value="payments" className="mt-6">
        {paymentsContent}
      </TabsContent>
    </Tabs>
  )
}
