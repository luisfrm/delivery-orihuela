"use client"

import { useState } from "react"
import Image from "next/image"
import { CreditCard, ZoomIn, Type, Eye } from "lucide-react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ImageZoomModal } from "@/components/ui/image-zoom-modal"
import type { OrderWithClient } from "@/lib/types"

interface OrderPaymentMethodCardProps {
  order: OrderWithClient
  className?: string
}

/**
 * Card de "Método de pago" mostrada en el detalle de pedido
 * del admin. Solo se renderiza si el order tiene un método
 * asociado. Para campos text muestra el valor; para campos
 * image muestra un thumbnail con zoom al hacer click.
 *
 * El método y los valores son un SNAPSHOT guardado en el
 * order al momento de creación, por lo que se muestran
 * aunque el admin edite o elimine el método después.
 */
export function OrderPaymentMethodCard({
  order,
  className,
}: OrderPaymentMethodCardProps) {
  const [zoomImage, setZoomImage] = useState<{
    url: string
    label: string
  } | null>(null)

  if (!order.payment_method_id) return null

  const values = order.payment_values ?? []

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CreditCard className="size-4" />
            </div>
            <div>
              <CardTitle>Método de pago</CardTitle>
              <p className="text-label-md text-on-surface-variant mt-0.5">
                {order.payment_method_name}
              </p>
            </div>
          </div>
        </CardHeader>
        {values.length > 0 && (
          <CardContent>
            <dl className="space-y-3">
              {values.map((v) => (
                <div key={v.fieldId} className="space-y-1">
                  <dt className="text-label-md text-on-surface-variant flex items-center gap-1.5">
                    {v.type === "text" ? (
                      <Type className="size-3.5" />
                    ) : v.type === "visual" ? (
                      <Eye className="size-3.5" />
                    ) : (
                      <ZoomIn className="size-3.5" />
                    )}
                    {v.label}
                  </dt>
                  <dd className="text-body-md text-on-surface">
                    {v.type === "text" ? (
                      <span className="break-all">{v.value}</span>
                    ) : v.type === "visual" ? (
                      <span className="block px-3 py-2 rounded-md bg-surface-container-low border border-outline-variant/50 text-base font-semibold break-words">
                        {v.value}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          setZoomImage({ url: v.value, label: v.label })
                        }
                        className="relative h-32 w-full overflow-hidden rounded-lg border border-outline-variant bg-surface-container hover:opacity-90 transition-opacity"
                        aria-label={`Ver imagen: ${v.label}`}
                      >
                        <Image
                          src={v.value}
                          alt={v.label}
                          fill
                          sizes="(min-width: 768px) 50vw, 100vw"
                          className="object-cover"
                          unoptimized
                        />
                      </button>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        )}
      </Card>

      <ImageZoomModal
        imageUrl={zoomImage?.url ?? null}
        label={zoomImage?.label ?? ""}
        onClose={() => setZoomImage(null)}
      />
    </>
  )
}
