"use client"

import { useEffect, useState, useTransition } from "react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import { getDailyOrdersAction } from "@/lib/actions/dashboard"
import { CalendarDays } from "lucide-react"

type Days = 7 | 14 | 30

interface Props {
  initialData: { date: string; label: string; count: number }[]
}

const OPTIONS = [
  { value: "7", label: "7 días" },
  { value: "14", label: "14 días" },
  { value: "30", label: "30 días" },
] as const

export function DailyOrdersChart({ initialData }: Props) {
  const [days, setDays] = useState<Days>(14)
  const [data, setData] = useState(initialData)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (days === 14 && initialData.length === 14) return
    startTransition(async () => {
      const res = await getDailyOrdersAction(days)
      setData(res)
    })
  }, [days, initialData.length])

  const hasData = data.some((d) => d.count > 0)
  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <Card variant="surface" className="flex flex-col overflow-hidden">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-[15px]">
              <span className="flex size-8 items-center justify-center rounded-lg bg-secondary-container text-on-secondary-container">
                <CalendarDays className="size-4" />
              </span>
              Pedidos por día
            </CardTitle>
            <CardDescription>Evolución diaria · últimos {days} días</CardDescription>
          </div>
          <Select
            options={OPTIONS as unknown as { value: string; label: string }[]}
            value={String(days)}
            onChange={(v) => setDays(Number(v) as Days)}
            size="sm"
            className="w-[110px] shrink-0"
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col min-h-[280px]">
        {!hasData ? (
          <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant bg-surface-container-low/50 px-4 py-10">
            <p className="text-body-sm font-medium text-on-surface">Sin pedidos en este periodo</p>
            <p className="text-label-md text-on-surface-variant mt-1">Los días con pedidos aparecerán aquí.</p>
          </div>
        ) : (
          <div className={`flex flex-1 flex-col justify-center transition-opacity ${isPending ? "opacity-60" : "opacity-100"}`}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.4} vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} interval={days === 30 ? 4 : 1} />
                <YAxis allowDecimals={false} domain={[0, max < 5 ? 5 : "auto"]} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={24} />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.15 }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.[0]) return null
                    const d = payload[0].payload as (typeof data)[number]
                    return (
                      <div className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 shadow-md">
                        <p className="text-label-md text-on-surface-variant">{d.label}</p>
                        <p className="text-body-sm font-bold text-primary">{d.count} pedidos</p>
                      </div>
                    )
                  }}
                />
                <Bar dataKey="count" fill="var(--primary)" radius={[6, 6, 0, 0]} barSize={days === 30 ? 10 : days === 14 ? 16 : 22} />
              </BarChart>
            </ResponsiveContainer>
            <p className="mt-2 text-label-md text-on-surface-variant text-right">Máx {max} pedidos/día</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
