"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { EmptyState } from "@/components/ui/empty-state"
import { formatMoneda, formatearFecha } from "@/lib/utils"
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  Calendar,
  Wallet,
} from "lucide-react"
import { toast } from "sonner"

const TIPOS_TRANSACCION = [
  { value: "INGRESO", label: "Ingreso", icon: TrendingUp },
  { value: "EGRESO_MATERIAL", label: "Egreso · Material", icon: TrendingDown },
  { value: "EGRESO_SERVICIO", label: "Egreso · Servicio", icon: TrendingDown },
  { value: "EGRESO_OTRO", label: "Egreso · Otro", icon: TrendingDown },
]

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

export default function FinanzasPage() {
  const [transacciones, setTransacciones] = useState<any[]>([])
  const [resumen, setResumen] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1)
  const [añoSeleccionado, setAñoSeleccionado] = useState(new Date().getFullYear())

  const [formData, setFormData] = useState({
    tipo: "INGRESO",
    concepto: "",
    monto: "",
    fecha: new Date().toISOString().split("T")[0],
    categoria: "",
    referencia: "",
    notas: "",
  })

  const fetchData = async () => {
    try {
      const [transRes, resumenRes] = await Promise.all([
        fetch(`/api/finanzas?mes=${mesSeleccionado}&año=${añoSeleccionado}`),
        fetch(`/api/finanzas/resumen?mes=${mesSeleccionado}&año=${añoSeleccionado}`),
      ])
      if (transRes.ok) setTransacciones(await transRes.json())
      if (resumenRes.ok) setResumen(await resumenRes.json())
    } catch (error) {
      toast.error("Error al cargar datos financieros")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [mesSeleccionado, añoSeleccionado])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.concepto || !formData.monto) {
      toast.error("Completa los campos requeridos")
      return
    }
    try {
      const response = await fetch("/api/finanzas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      if (!response.ok) throw new Error("Error al guardar")
      toast.success("Transacción registrada")
      setIsDialogOpen(false)
      setFormData({
        tipo: "INGRESO",
        concepto: "",
        monto: "",
        fecha: new Date().toISOString().split("T")[0],
        categoria: "",
        referencia: "",
        notas: "",
      })
      fetchData()
    } catch (error) {
      toast.error("Error al guardar la transacción")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta transacción?")) return
    try {
      const response = await fetch(`/api/finanzas/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Error al eliminar")
      toast.success("Transacción eliminada")
      fetchData()
    } catch (error) {
      toast.error("Error al eliminar la transacción")
    }
  }

  const balancePositivo = resumen ? resumen.balance >= 0 : true

  return (
    <div className="space-y-8">
      <PageHeader
        title="Finanzas"
        description="Control de ingresos y egresos del negocio"
        icon={Wallet}
        actions={
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva transacción
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-card p-3 shadow-sm">
        <Calendar className="ml-1 h-4 w-4 text-muted-foreground" />
        <select
          value={mesSeleccionado}
          onChange={(e) => setMesSeleccionado(Number(e.target.value))}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {MESES.map((mes, i) => (
            <option key={i} value={i + 1}>
              {mes}
            </option>
          ))}
        </select>
        <Input
          type="number"
          value={añoSeleccionado}
          onChange={(e) => setAñoSeleccionado(Number(e.target.value))}
          className="h-9 w-24"
        />
        <span className="ml-auto text-xs text-muted-foreground">
          Periodo seleccionado: {MESES[mesSeleccionado - 1]} {añoSeleccionado}
        </span>
      </div>

      {resumen && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Ingresos"
            value={formatMoneda(resumen.ingresos)}
            hint={`${MESES[mesSeleccionado - 1]} ${añoSeleccionado}`}
            icon={TrendingUp}
            tone="success"
          />
          <StatCard
            label="Egresos"
            value={formatMoneda(resumen.egresos)}
            hint={`${MESES[mesSeleccionado - 1]} ${añoSeleccionado}`}
            icon={TrendingDown}
            tone="danger"
          />
          <StatCard
            label="Balance"
            value={
              <span className={balancePositivo ? "text-success" : "text-destructive"}>
                {formatMoneda(resumen.balance)}
              </span>
            }
            hint={`${resumen.totalTransacciones} transacciones`}
            icon={DollarSign}
            tone={balancePositivo ? "success" : "danger"}
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Transacciones</CardTitle>
          <CardDescription>Historial de movimientos del periodo</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Cargando transacciones...
            </p>
          ) : transacciones.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="No hay transacciones"
              description="Registra tu primera transacción del periodo"
              action={
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva transacción
                </Button>
              }
            />
          ) : (
            <div className="divide-y divide-border/60">
              {transacciones.map((trans) => {
                const tipoInfo = TIPOS_TRANSACCION.find((t) => t.value === trans.tipo)
                const Icon = tipoInfo?.icon || DollarSign
                const isIngreso = trans.tipo === "INGRESO"
                return (
                  <div
                    key={trans.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ring-1 ${
                          isIngreso
                            ? "bg-success/10 text-success ring-success/20"
                            : "bg-destructive/10 text-destructive ring-destructive/20"
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {trans.concepto}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          <span>{formatearFecha(trans.fecha)}</span>
                          {trans.categoria && <span>· {trans.categoria}</span>}
                          {trans.referencia && <span>· Ref: {trans.referencia}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p
                          className={`text-base font-semibold tabular-nums ${
                            isIngreso ? "text-success" : "text-destructive"
                          }`}
                        >
                          {isIngreso ? "+" : "−"}
                          {formatMoneda(Number(trans.monto))}
                        </p>
                        <Badge variant="outline" className="text-[10px] font-normal">
                          {tipoInfo?.label}
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(trans.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva transacción</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="tipo">Tipo *</Label>
              <select
                id="tipo"
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {TIPOS_TRANSACCION.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="concepto">Concepto *</Label>
              <Input
                id="concepto"
                value={formData.concepto}
                onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                placeholder="Descripción de la transacción"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="monto">Monto *</Label>
                <Input
                  id="monto"
                  type="number"
                  step="0.01"
                  value={formData.monto}
                  onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="fecha">Fecha</Label>
                <Input
                  id="fecha"
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="categoria">Categoría</Label>
                <Input
                  id="categoria"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  placeholder="Ventas, Materiales..."
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="referencia">Referencia</Label>
                <Input
                  id="referencia"
                  value={formData.referencia}
                  onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                  placeholder="Factura #123"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notas">Notas</Label>
              <Textarea
                id="notas"
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                placeholder="Observaciones adicionales..."
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar transacción</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
