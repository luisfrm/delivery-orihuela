import { User, MapPin, CreditCard, Bell } from "lucide-react"

export default function ProfilePage() {
  const menuItems = [
    { icon: <User className="w-5 h-5" />, label: "Datos Personales", href: "/profile/edit" },
    { icon: <MapPin className="w-5 h-5" />, label: "Direcciones", href: "/profile/addresses" },
    { icon: <CreditCard className="w-5 h-5" />, label: "Métodos de Pago", href: "/profile/payment" },
    { icon: <Bell className="w-5 h-5" />, label: "Notificaciones", href: "/profile/notifications" },
  ]

  return (
    <div className="px-[20px] py-6 space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-primary-container flex items-center justify-center">
          <span className="text-3xl font-bold text-on-primary-container">U</span>
        </div>
        <div>
          <h1 className="text-headline-md font-bold text-on-surface">Mi Perfil</h1>
          <p className="text-body-md text-on-surface-variant">Gestiona tu información</p>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-outline-variant overflow-hidden">
        {menuItems.map((item, index) => (
          <a
            key={item.href}
            href={item.href}
            className={`flex items-center gap-4 p-4 hover:bg-surface-container-low transition-colors ${
              index !== menuItems.length - 1 ? "border-b border-outline-variant" : ""
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-primary">
              {item.icon}
            </div>
            <span className="text-body-md font-medium text-on-surface">{item.label}</span>
          </a>
        ))}
      </div>
    </div>
  )
}