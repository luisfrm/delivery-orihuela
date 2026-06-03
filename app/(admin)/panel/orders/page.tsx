export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-headline-lg font-bold text-on-surface">Pedidos</h1>
        <p className="text-body-md text-on-surface-variant mt-1">Gestiona los pedidos del sistema</p>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-outline-variant">
        <div className="p-6 border-b border-outline-variant">
          <div className="flex items-center justify-between">
            <p className="text-body-md text-on-surface-variant">No hay pedidos registrados</p>
          </div>
        </div>
      </div>
    </div>
  )
}