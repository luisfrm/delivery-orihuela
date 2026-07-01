import { Settings as SettingsIcon } from "lucide-react"

import { getOrganizationSettings } from "@/lib/actions/organization"
import { SettingsForm } from "./_components/SettingsForm"
import { SettingsTabs } from "./_components/SettingsTabs"
import { PaymentsManager } from "./_components/PaymentsManager"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Configuración — Panel Admin",
}

export default async function SettingsPage() {
  const initial = await getOrganizationSettings()

  return (
    <div className="max-w-7xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <SettingsIcon className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-headline-lg font-bold text-on-surface">
            Configuración
          </h1>
          <p className="text-body-sm text-on-surface-variant">
            Personaliza la identidad pública y los métodos de pago.
          </p>
        </div>
      </div>

      <SettingsTabs
        generalContent={<SettingsForm initial={initial} />}
        paymentsContent={<PaymentsManager />}
      />
    </div>
  )
}
