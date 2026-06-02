import { Tag } from "lucide-react"

export function DailyOffersBanner() {
  return (
    <section className="px-[20px] relative z-20 mt-[8px]">
      <div className="bg-primary-container rounded-xl p-[16px] flex flex-row items-center justify-between shadow-lg">
        <div className="flex flex-col gap-[4px]">
          <h3 className="text-title-lg text-on-primary">Ofertas del Día</h3>
          <p className="text-body-md text-on-primary opacity-90">Hasta 50% de descuento en viajes</p>
        </div>
        <Tag className="text-on-primary text-4xl" />
      </div>
    </section>
  )
}