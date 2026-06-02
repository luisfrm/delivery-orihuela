import { Package, Users, ShoppingCart, TrendingUp } from "lucide-react"

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-headline-lg font-bold text-on-surface">Dashboard</h1>
        <p className="text-body-md text-on-surface-variant mt-1">Bienvenido al panel de administración</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-xl p-6 shadow-sm border border-outline-variant">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-label-md text-on-surface-variant">Pedidos Totales</p>
              <p className="text-3xl font-bold text-on-surface mt-1">0</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-on-primary-container" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-outline-variant">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-label-md text-on-surface-variant">Usuarios</p>
              <p className="text-3xl font-bold text-on-surface mt-1">0</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
              <Users className="w-6 h-6 text-on-secondary-container" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-outline-variant">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-label-md text-on-surface-variant">En Proceso</p>
              <p className="text-3xl font-bold text-on-surface mt-1">0</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center">
              <Package className="w-6 h-6 text-on-primary-container" />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border border-outline-variant">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-label-md text-on-surface-variant">Ingresos</p>
              <p className="text-3xl font-bold text-on-surface mt-1">$0</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-on-secondary-container" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}