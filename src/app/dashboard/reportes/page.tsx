"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { formatMoneda } from "@/lib/utils"
import {
  BarChart3,
  TrendingUp,
  Package,
  Users,
  FileText,
  DollarSign,
} from "lucide-react"

type Metric = {
  label: string
  value: React.ReactNode
  tone?: "default" | "success" | "danger" | "info" | "warning" | "primary"
}

function MetricGrid({ metrics }: { metrics: Metric[] }) {
  const toneClass: Record<NonNullable<Metric["tone"]>, string> = {
    default: "text-foreground",
    success: "text-success",
    danger: "text-destructive",
    info: "text-info",
    warning: "text-warning-foreground",
    primary: "text-primary",
  }
  return (
    <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((m) => (
        <div key={m.label} className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {m.label}
          </p>
          <p
            className={`text-2xl font-semibold tabular-nums ${
              toneClass[m.tone ?? "default"]
            }`}
          >
            {m.value}
          </p>
        </div>
      ))}
    </div>
  )
}

function ReportSection({
  title,
  icon: Icon,
  description,
  metrics,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
  metrics: Metric[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <MetricGrid metrics={metrics} />
      </CardContent>
    </Card>
  )
}

export default function ReportesPage() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          materialesRes,
          clientesRes,
          prendasRes,
          cotizacionesRes,
          finanzasRes,
        ] = await Promise.all([
          fetch("/api/materiales"),
          fetch("/api/clientes"),
          fetch("/api/prendas/calculadas"),
          fetch("/api/cotizaciones"),
          fetch("/api/finanzas/resumen"),
        ])

        const materiales = materialesRes.ok ? await materialesRes.json() : []
        const clientes = clientesRes.ok ? await clientesRes.json() : []
        const prendas = prendasRes.ok ? await prendasRes.json() : []
        const cotizaciones = cotizacionesRes.ok ? await cotizacionesRes.json() : []
        const finanzas = finanzasRes.ok ? await finanzasRes.json() : null

        setStats({
          materiales: {
            total: materiales.length,
            activos: materiales.filter((m: any) => m.activo).length,
            bajoStock: materiales.filter(
              (m: any) =>
                m.activo && Number(m.stockActual) <= Number(m.stockMinimo),
            ).length,
            valorInventario: materiales.reduce(
              (sum: number, m: any) =>
                sum + Number(m.stockActual) * Number(m.costoUnitario),
              0,
            ),
          },
          clientes: {
            total: clientes.length,
            conMedidas: clientes.filter(
              (c: any) => c.medidas && c.medidas.length > 0,
            ).length,
            conPrendas: clientes.filter(
              (c: any) => c._count && c._count.prendas > 0,
            ).length,
          },
          prendas: {
            total: prendas.length,
            conCliente: prendas.filter((p: any) => p.clienteId).length,
            valorTotal: prendas.reduce(
              (sum: number, p: any) => sum + Number(p.precioVentaUnitario),
              0,
            ),
          },
          cotizaciones: {
            total: cotizaciones.length,
            cotizadas: cotizaciones.filter((c: any) => c.estado === "COTIZADO").length,
            aceptadas: cotizaciones.filter((c: any) => c.estado === "ACEPTADO").length,
            enProceso: cotizaciones.filter((c: any) => c.estado === "EN_PROCESO").length,
            entregadas: cotizaciones.filter((c: any) => c.estado === "ENTREGADO").length,
            valorTotal: cotizaciones.reduce(
              (sum: number, c: any) => sum + Number(c.total),
              0,
            ),
          },
          finanzas,
        })
      } catch (error) {
        console.error("Error al cargar estadísticas:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando reportes...</p>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Error al cargar datos</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reportes y estadísticas"
        description="Resumen general del negocio"
        icon={BarChart3}
      />

      <div className="space-y-6">
        <ReportSection
          title="Inventario de materiales"
          icon={Package}
          metrics={[
            { label: "Total", value: stats.materiales.total },
            { label: "Activos", value: stats.materiales.activos, tone: "success" },
            { label: "Bajo stock", value: stats.materiales.bajoStock, tone: "danger" },
            {
              label: "Valor inventario",
              value: formatMoneda(stats.materiales.valorInventario),
            },
          ]}
        />

        <ReportSection
          title="Clientes"
          icon={Users}
          metrics={[
            { label: "Total", value: stats.clientes.total },
            { label: "Con medidas", value: stats.clientes.conMedidas, tone: "info" },
            {
              label: "Con prendas",
              value: stats.clientes.conPrendas,
              tone: "primary",
            },
          ]}
        />

        <ReportSection
          title="Prendas calculadas"
          icon={TrendingUp}
          metrics={[
            { label: "Total cálculos", value: stats.prendas.total },
            { label: "Con cliente", value: stats.prendas.conCliente, tone: "info" },
            {
              label: "Valor total",
              value: formatMoneda(stats.prendas.valorTotal),
              tone: "success",
            },
          ]}
        />

        <ReportSection
          title="Cotizaciones"
          icon={FileText}
          metrics={[
            { label: "Total", value: stats.cotizaciones.total },
            { label: "Cotizadas", value: stats.cotizaciones.cotizadas, tone: "info" },
            {
              label: "Aceptadas",
              value: stats.cotizaciones.aceptadas,
              tone: "success",
            },
            {
              label: "En proceso",
              value: stats.cotizaciones.enProceso,
              tone: "warning",
            },
            {
              label: "Entregadas",
              value: stats.cotizaciones.entregadas,
              tone: "primary",
            },
            {
              label: "Valor total",
              value: formatMoneda(stats.cotizaciones.valorTotal),
            },
          ]}
        />

        {stats.finanzas && (
          <ReportSection
            title="Finanzas del mes"
            icon={DollarSign}
            description="Resumen financiero actual"
            metrics={[
              {
                label: "Ingresos",
                value: formatMoneda(stats.finanzas.ingresos),
                tone: "success",
              },
              {
                label: "Egresos",
                value: formatMoneda(stats.finanzas.egresos),
                tone: "danger",
              },
              {
                label: "Balance",
                value: formatMoneda(stats.finanzas.balance),
                tone: stats.finanzas.balance >= 0 ? "success" : "danger",
              },
              {
                label: "Transacciones",
                value: stats.finanzas.totalTransacciones,
              },
            ]}
          />
        )}
      </div>
    </div>
  )
}
