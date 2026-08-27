"use client"

import { useEffect, useState, useTransition } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { formatPriceCents } from "@/lib/restaurants/menu-format"
import { getTopStoresChartAction } from "@/lib/actions/dashboard"
import { Store, TrendingUp } from "lucide-react"

type Range = "week" | "month" | "all"
type Metric = "revenue" | "orders"

interface Props {
  initialData: { storeId: string; storeName: string; count: number; revenueCents: number }[]
}

const RANGE_OPTIONS = [
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "all", label: "Todo" },
] as const

const METRIC_OPTIONS = [
  { value: "revenue", label: "Ingresos" },
  { value: "orders", label: "Pedidos" },
] as const

export function TopRestaurantsChart({ initialData }: Props) {
  const [range, setRange] = useState<Range>("month")
  const [metric, setMetric] = useState<Metric>("revenue")
  const [data, setData] = useState(initialData)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const res = await getTopStoresChartAction(range, 6)
      setData(res)
    })
  }, [range])

  const sorted = [...data].sort((a, b) => (metric === "revenue" ? b.revenueCents - a.revenueCents : b.count - a.count))

  const chartData = sorted.map((d) => ({
    name: d.storeName.length > 14 ? d.storeName.slice(0, 14) + "…" : d.storeName,
    fullName: d.storeName,
    value: metric === "revenue" ? d.revenueCents : d.count,
    display: metric === "revenue" ? formatPriceCents(d.revenueCents) : `${d.count}`,
  }))

  const hasData = chartData.length > 0 && chartData.some((d) => d.value > 0)

  return (
    <Card variant="surface" className="flex flex-col overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-[15px]">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Store className="size-4" />
              </span>
              Top restaurantes
            </CardTitle>
            <CardDescription className="mt-1">Los 6 que más {metric === "revenue" ? "ingresan" : "venden"} · {range === "week" ? "esta semana" : range === "month" ? "este mes" : "histórico"}</CardDescription>
          </div>
          <div className="flex shrink-0 gap-2">
            <Select options={METRIC_OPTIONS as unknown as { value: string; label: string }[]} value={metric} onChange={(v) => setMetric(v as Metric)} size="sm" className="w-[112px]" />
            <Select options={RANGE_OPTIONS as unknown as { value: string; label: string }[]} value={range} onChange={(v) => setRange(v as Range)} size="sm" className="w-[110px]" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col min-h-[280px]">
        {!hasData ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface-container-low/50 px-4 py-10">
            <div className="flex size-10 items-center justify-center rounded-xl bg-surface-container text-on-surface-variant">
              <TrendingUp className="size-5" />
            </div>
            <p className="mt-2 text-body-sm font-medium text-on-surface">Sin datos en este periodo</p>
            <p className="text-label-md text-on-surface-variant">Prueba con “Todo” o espera pedidos entregados.</p>
          </div>
        ) : (
          <div className={`flex flex-1 flex-col justify-center transition-opacity ${isPending ? "opacity-60" : "opacity-100"}`}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => (metric === "revenue" ? `${(v / 100).toFixed(0)}€` : `${v}`)}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 12, fill: "var(--foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                {/* Tooltip uses shadcn style via inline */}
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.2 }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null
                    const d = payload[0].payload as (typeof chartData)[number]
                    return (
                      <div className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 shadow-md">
                        <p className="text-body-sm font-semibold text-on-surface">{d.fullName}</p>
                        <p className="text-body-sm text-primary font-bold">{d.display}</p>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="value" fill="var(--primary)" radius={[0, 8, 8, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-2 text-label-md text-on-surface-variant text-right">Top 6 · {metric === "revenue" ? "ingresos entregados" : "pedidos entregados"}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
