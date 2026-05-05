"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { EmptyState } from "@/components/ui/empty-state"
import { GaleriaImagenes } from "@/components/prendas/galeria-imagenes"
import { formatMoneda, formatearFecha } from "@/lib/utils"
import { History, Eye, Trash2, TrendingUp, Package, Users } from "lucide-react"
import { toast } from "sonner"

export default function PrendasCalculadasPage() {
  const [prendas, setPrendas] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPrenda, setSelectedPrenda] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [imagenes, setImagenes] = useState<any[]>([])

  const fetchPrendas = async () => {
    try {
      const response = await fetch("/api/prendas/calculadas")
      if (!response.ok) throw new Error("Error al cargar prendas")
      const data = await response.json()
      setPrendas(data)
    } catch (error) {
      toast.error("Error al cargar historial")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPrendas()
  }, [])

  const handleView = async (prenda: any) => {
    setSelectedPrenda(prenda)
    setIsDialogOpen(true)
    try {
      const response = await fetch(`/api/prendas/calculadas/${prenda.id}/imagenes`)
      if (response.ok) setImagenes(await response.json())
    } catch (error) {
      console.error("Error al cargar imágenes:", error)
    }
  }

  const handleUpdateImagenes = async () => {
    if (!selectedPrenda) return
    try {
      const response = await fetch(`/api/prendas/calculadas/${selectedPrenda.id}/imagenes`)
      if (response.ok) setImagenes(await response.json())
    } catch (error) {
      console.error("Error al cargar imágenes:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta prenda del historial?")) return
    try {
      const response = await fetch(`/api/prendas/calculadas/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Error al eliminar")
      toast.success("Prenda eliminada")
      fetchPrendas()
    } catch (error) {
      toast.error("Error al eliminar la prenda")
    }
  }

  const totalCalculos = prendas.length
  const valorTotalInventario = prendas.reduce(
    (sum, p) => sum + Number(p.precioVentaUnitario),
    0,
  )
  const conCliente = prendas.filter((p) => p.clienteId).length

  return (
    <div className="space-y-8">
      <PageHeader
        title="Historial de cálculos"
        description="Todas las prendas calculadas y guardadas"
        icon={History}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total cálculos"
          value={totalCalculos}
          hint="Prendas calculadas"
          icon={History}
          tone="primary"
        />
        <StatCard
          label="Valor total"
          value={formatMoneda(valorTotalInventario)}
          hint="Suma de precios unitarios"
          icon={TrendingUp}
          tone="success"
        />
        <StatCard
          label="Con cliente"
          value={conCliente}
          hint="Asignadas a clientes"
          icon={Users}
          tone="info"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prendas calculadas</CardTitle>
          <CardDescription>
            {totalCalculos} prenda{totalCalculos !== 1 ? "s" : ""} en el historial
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Cargando historial...
            </p>
          ) : prendas.length === 0 ? (
            <EmptyState
              icon={History}
              title="No hay cálculos guardados"
              description="Usa la calculadora para crear tu primer cálculo de costo"
            />
          ) : (
            <div className="divide-y divide-border/60">
              {prendas.map((prenda) => (
                <div
                  key={prenda.id}
                  className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground">
                        {prenda.nombre}
                      </h3>
                      {prenda.talla && (
                        <Badge variant="outline" className="text-[10px] font-normal">
                          Talla {prenda.talla}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                      <span>{formatearFecha(prenda.fechaCalculo)}</span>
                      {prenda.cliente && (
                        <span>· Cliente: {prenda.cliente.nombre}</span>
                      )}
                      {prenda.prendaBase && (
                        <span>· Base: {prenda.prendaBase.nombre}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Precio unitario
                      </p>
                      <p className="text-base font-semibold tabular-nums text-success">
                        {formatMoneda(Number(prenda.precioVentaUnitario))}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        Costo: {formatMoneda(Number(prenda.costoTotalUnitario))}
                      </p>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleView(prenda)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(prenda.id)}
                        className="text-muted-foreground hover:text-destructive"
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
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPrenda?.nombre}</DialogTitle>
          </DialogHeader>

          {selectedPrenda && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-border/60 bg-muted/40 p-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Fecha de cálculo
                  </p>
                  <p className="font-medium">{formatearFecha(selectedPrenda.fechaCalculo)}</p>
                </div>
                {selectedPrenda.talla && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Talla
                    </p>
                    <p className="font-medium">{selectedPrenda.talla}</p>
                  </div>
                )}
                {selectedPrenda.cliente && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Cliente
                    </p>
                    <p className="font-medium">{selectedPrenda.cliente.nombre}</p>
                  </div>
                )}
                {selectedPrenda.prendaBase && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Prenda base
                    </p>
                    <p className="font-medium">{selectedPrenda.prendaBase.nombre}</p>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Desglose de costos
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Materiales</span>
                    <span className="font-medium tabular-nums">
                      {formatMoneda(Number(selectedPrenda.costoMateriales))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mano de obra</span>
                    <span className="font-medium tabular-nums">
                      {formatMoneda(Number(selectedPrenda.costoManoObra))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Costos indirectos</span>
                    <span className="font-medium tabular-nums">
                      {formatMoneda(Number(selectedPrenda.costosIndirectos))}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-border/60 pt-2">
                    <span className="font-medium">Costo total</span>
                    <span className="text-base font-semibold tabular-nums">
                      {formatMoneda(Number(selectedPrenda.costoTotalUnitario))}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Precios de venta
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-success/20 bg-success/5 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Unitario
                    </p>
                    <p className="text-2xl font-semibold tabular-nums text-success">
                      {formatMoneda(Number(selectedPrenda.precioVentaUnitario))}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Margen: {Number(selectedPrenda.margenAplicadoPct)}%
                    </p>
                  </div>
                  <div className="rounded-lg border border-info/20 bg-info/5 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Por docena
                    </p>
                    <p className="text-2xl font-semibold tabular-nums text-info">
                      {formatMoneda(Number(selectedPrenda.precioVentaDocena))}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">15% descuento</p>
                  </div>
                </div>
              </div>

              {selectedPrenda.materiales && selectedPrenda.materiales.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Materiales utilizados
                  </h3>
                  <div className="space-y-1">
                    {selectedPrenda.materiales.map((m: any) => (
                      <div
                        key={m.id}
                        className="flex justify-between gap-2 rounded-md bg-muted/40 px-3 py-2 text-sm"
                      >
                        <span className="truncate">{m.material.nombre}</span>
                        <span className="font-medium tabular-nums">
                          {Number(m.cantidadUsada)} {m.material.unidadMedida} ×{" "}
                          {formatMoneda(Number(m.costoUnitario))} ={" "}
                          {formatMoneda(Number(m.costoTotal))}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedPrenda.notasTecnicas && (
                <div>
                  <h3 className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Notas técnicas
                  </h3>
                  <p className="text-sm text-foreground">{selectedPrenda.notasTecnicas}</p>
                </div>
              )}

              <div className="border-t border-border/60 pt-4">
                <GaleriaImagenes
                  prendaId={selectedPrenda.id}
                  imagenes={imagenes}
                  onUpdate={handleUpdateImagenes}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
