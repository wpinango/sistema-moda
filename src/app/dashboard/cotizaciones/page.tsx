"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { EmptyState } from "@/components/ui/empty-state"
import { CotizacionForm } from "@/components/forms/cotizacion-form"
import { formatMoneda, formatearFecha } from "@/lib/utils"
import {
  FileText,
  Plus,
  Eye,
  Pencil,
  CheckCircle,
  Clock,
  XCircle,
  Trash2,
  Activity,
  Wallet,
} from "lucide-react"
import { toast } from "sonner"

type EstadoConfig = {
  value: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  className: string
}

const ESTADOS: EstadoConfig[] = [
  {
    value: "COTIZADO",
    label: "Cotizado",
    icon: FileText,
    className: "bg-info/10 text-info ring-1 ring-info/20",
  },
  {
    value: "ACEPTADO",
    label: "Aceptado",
    icon: CheckCircle,
    className: "bg-success/10 text-success ring-1 ring-success/20",
  },
  {
    value: "EN_PROCESO",
    label: "En proceso",
    icon: Clock,
    className: "bg-warning/15 text-warning-foreground ring-1 ring-warning/30",
  },
  {
    value: "ENTREGADO",
    label: "Entregado",
    icon: CheckCircle,
    className: "bg-primary/10 text-primary ring-1 ring-primary/20",
  },
  {
    value: "CANCELADO",
    label: "Cancelado",
    icon: XCircle,
    className: "bg-destructive/10 text-destructive ring-1 ring-destructive/20",
  },
]

export default function CotizacionesPage() {
  const [cotizaciones, setCotizaciones] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCotizacion, setSelectedCotizacion] = useState<any>(null)
  const [viewCotizacion, setViewCotizacion] = useState<any>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const fetchCotizaciones = async () => {
    try {
      const response = await fetch("/api/cotizaciones")
      if (!response.ok) throw new Error("Error al cargar cotizaciones")
      const data = await response.json()
      setCotizaciones(data)
    } catch (error) {
      toast.error("Error al cargar cotizaciones")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCotizaciones()
  }, [])

  const handleNew = () => {
    setSelectedCotizacion(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (cotizacion: any) => {
    setSelectedCotizacion(cotizacion)
    setIsDialogOpen(true)
  }

  const handleView = (cotizacion: any) => {
    setViewCotizacion(cotizacion)
    setIsViewDialogOpen(true)
  }

  const handleSuccess = () => {
    setIsDialogOpen(false)
    setSelectedCotizacion(null)
    fetchCotizaciones()
  }

  const handleDelete = async (id: string, numero: string) => {
    if (!confirm(`¿Estás seguro de eliminar la cotización "${numero}"?\n\nEsta acción no se puede deshacer.`)) {
      return
    }
    try {
      const response = await fetch(`/api/cotizaciones/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Error al eliminar")
      toast.success("Cotización eliminada", { description: `Cotización ${numero} eliminada` })
      fetchCotizaciones()
    } catch (error) {
      toast.error("Error al eliminar cotización")
    }
  }

  const handleChangeEstado = async (id: string, nuevoEstado: string) => {
    try {
      const response = await fetch(`/api/cotizaciones/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      })
      if (!response.ok) throw new Error("Error al actualizar estado")
      toast.success("Estado actualizado")
      fetchCotizaciones()
    } catch (error) {
      toast.error("Error al actualizar estado")
    }
  }

  const getEstadoBadge = (estado: string) => {
    const estadoInfo = ESTADOS.find((e) => e.value === estado)
    if (!estadoInfo) return null
    const Icon = estadoInfo.icon
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${estadoInfo.className}`}
      >
        <Icon className="h-3 w-3" />
        {estadoInfo.label}
      </span>
    )
  }

  const estadisticas = {
    total: cotizaciones.length,
    cotizadas: cotizaciones.filter((c) => c.estado === "COTIZADO").length,
    aceptadas: cotizaciones.filter((c) => c.estado === "ACEPTADO").length,
    enProceso: cotizaciones.filter((c) => c.estado === "EN_PROCESO").length,
    entregadas: cotizaciones.filter((c) => c.estado === "ENTREGADO").length,
    valorTotal: cotizaciones.reduce((sum, c) => sum + Number(c.total), 0),
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Cotizaciones"
        description="Gestiona las cotizaciones de tus clientes"
        icon={FileText}
        actions={
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva cotización
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total"
          value={estadisticas.total}
          hint="Cotizaciones registradas"
          icon={FileText}
          tone="primary"
        />
        <StatCard
          label="Pendientes"
          value={estadisticas.cotizadas}
          hint="Por aceptar"
          icon={Clock}
          tone="warning"
        />
        <StatCard
          label="Activas"
          value={estadisticas.aceptadas + estadisticas.enProceso}
          hint="Aceptadas o en proceso"
          icon={Activity}
          tone="info"
        />
        <StatCard
          label="Valor total"
          value={formatMoneda(estadisticas.valorTotal)}
          hint="Suma de todas"
          icon={Wallet}
          tone="success"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de cotizaciones</CardTitle>
          <CardDescription>
            {estadisticas.total} cotización{estadisticas.total !== 1 ? "es" : ""} registrada
            {estadisticas.total !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Cargando cotizaciones...
            </p>
          ) : cotizaciones.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No hay cotizaciones"
              description="Crea tu primera cotización para tus clientes"
              action={
                <Button onClick={handleNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva cotización
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-border/60">
              {cotizaciones.map((cotizacion) => (
                <div
                  key={cotizacion.id}
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">
                        {cotizacion.numero}
                      </h3>
                      {getEstadoBadge(cotizacion.estado)}
                    </div>
                    <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                      <span>Cliente: {cotizacion.cliente.nombre}</span>
                      <span>· {formatearFecha(cotizacion.createdAt)}</span>
                      {cotizacion.fechaEntrega && (
                        <span>· Entrega: {formatearFecha(cotizacion.fechaEntrega)}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Total
                      </p>
                      <p className="text-base font-semibold tabular-nums text-success">
                        {formatMoneda(Number(cotizacion.total))}
                      </p>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleView(cotizacion)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(cotizacion)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(cotizacion.id, cotizacion.numero)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCotizacion ? "Editar cotización" : "Nueva cotización"}
            </DialogTitle>
          </DialogHeader>
          <CotizacionForm
            cotizacion={selectedCotizacion}
            onSuccess={handleSuccess}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between gap-3">
              <span>{viewCotizacion?.numero}</span>
              {viewCotizacion && getEstadoBadge(viewCotizacion.estado)}
            </DialogTitle>
          </DialogHeader>

          {viewCotizacion && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Cliente
                  </p>
                  <p className="font-medium">{viewCotizacion.cliente.nombre}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Fecha
                  </p>
                  <p className="font-medium">{formatearFecha(viewCotizacion.createdAt)}</p>
                </div>
                {viewCotizacion.fechaEntrega && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Fecha de entrega
                    </p>
                    <p className="font-medium">{formatearFecha(viewCotizacion.fechaEntrega)}</p>
                  </div>
                )}
                {viewCotizacion.prendaCalculada && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Prenda
                    </p>
                    <p className="font-medium">{viewCotizacion.prendaCalculada.nombre}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2 rounded-lg border border-border/60 bg-muted/40 p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium tabular-nums">
                    {formatMoneda(Number(viewCotizacion.subtotal))}
                  </span>
                </div>
                {Number(viewCotizacion.descuento) > 0 && (
                  <div className="flex justify-between text-sm text-destructive">
                    <span>Descuento</span>
                    <span className="tabular-nums">
                      −{formatMoneda(Number(viewCotizacion.descuento))}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-border/60 pt-2">
                  <span className="font-medium">Total</span>
                  <span className="text-lg font-semibold tabular-nums text-success">
                    {formatMoneda(Number(viewCotizacion.total))}
                  </span>
                </div>
              </div>

              {viewCotizacion.notas && (
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                    Notas
                  </p>
                  <p className="text-sm text-foreground">{viewCotizacion.notas}</p>
                </div>
              )}

              <div>
                <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                  Cambiar estado
                </p>
                <div className="flex flex-wrap gap-2">
                  {ESTADOS.map((estado) => {
                    const Icon = estado.icon
                    const isActive = viewCotizacion.estado === estado.value
                    return (
                      <Button
                        key={estado.value}
                        variant={isActive ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleChangeEstado(viewCotizacion.id, estado.value)}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        {estado.label}
                      </Button>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
