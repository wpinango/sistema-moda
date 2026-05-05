"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { EmptyState } from "@/components/ui/empty-state"
import { AgregarPrendaForm } from "@/components/inventario/agregar-prenda-form"
import { ImportarExcel } from "@/components/inventario/importar-excel"
import { formatMoneda } from "@/lib/utils"
import {
  Package,
  Plus,
  Minus,
  AlertCircle,
  TrendingUp,
  ShoppingCart,
  PackagePlus,
  Trash2,
  Warehouse,
} from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"

export default function InventarioPage() {
  const [prendas, setPrendas] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPrenda, setSelectedPrenda] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [cantidad, setCantidad] = useState("")

  const fetchInventario = async () => {
    try {
      const response = await fetch("/api/prendas/calculadas?esParaInventario=true")
      if (!response.ok) throw new Error("Error al cargar inventario")
      const data = await response.json()
      setPrendas(data)
    } catch (error) {
      toast.error("Error al cargar inventario")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchInventario()
  }, [])

  const handleAgregarStock = (prenda: any) => {
    setSelectedPrenda(prenda)
    setIsDialogOpen(true)
    setCantidad("")
  }

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${nombre}" del inventario?\n\nEsta acción no se puede deshacer.`)) {
      return
    }
    try {
      const response = await fetch(`/api/prendas/calculadas/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Error al eliminar")
      toast.success("Prenda eliminada del inventario", {
        description: `${nombre} ha sido eliminada correctamente`,
      })
      fetchInventario()
    } catch (error) {
      toast.error("Error al eliminar")
    }
  }

  const handleActualizarStock = async (tipo: "agregar" | "vender") => {
    if (!selectedPrenda || !cantidad || parseInt(cantidad) <= 0) {
      toast.error("Ingresa una cantidad válida")
      return
    }
    const cantidadNum = parseInt(cantidad)
    try {
      const nuevaCantidad =
        tipo === "agregar"
          ? selectedPrenda.cantidadInventario + cantidadNum
          : Math.max(0, selectedPrenda.cantidadInventario - cantidadNum)

      const nuevasVendidas =
        tipo === "vender"
          ? selectedPrenda.cantidadVendida + cantidadNum
          : selectedPrenda.cantidadVendida

      const response = await fetch(`/api/prendas/calculadas/${selectedPrenda.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cantidadInventario: nuevaCantidad,
          cantidadVendida: nuevasVendidas,
        }),
      })

      if (!response.ok) throw new Error("Error al actualizar")

      toast.success(
        tipo === "agregar"
          ? `${cantidadNum} unidad(es) agregada(s) al inventario`
          : `${cantidadNum} unidad(es) vendida(s)`,
      )

      setIsDialogOpen(false)
      fetchInventario()
    } catch (error) {
      toast.error("Error al actualizar el inventario")
    }
  }

  const prendasBajoStock = prendas.filter(
    (p) => p.cantidadInventario <= p.stockMinimo && p.stockMinimo > 0,
  )
  const valorTotalInventario = prendas.reduce(
    (sum, p) => sum + p.cantidadInventario * Number(p.precioVentaUnitario),
    0,
  )
  const totalUnidades = prendas.reduce((sum, p) => sum + p.cantidadInventario, 0)
  const totalVendidas = prendas.reduce((sum, p) => sum + p.cantidadVendida, 0)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Inventario"
        description="Control de stock de prendas terminadas"
        icon={Warehouse}
        actions={
          <>
            <ImportarExcel onSuccess={fetchInventario} />
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <PackagePlus className="mr-2 h-4 w-4" />
              Agregar prenda
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total prendas"
          value={prendas.length}
          hint="Tipos diferentes"
          icon={Package}
          tone="primary"
        />
        <StatCard
          label="Unidades en stock"
          value={totalUnidades}
          hint="Disponibles"
          icon={Package}
          tone="info"
        />
        <StatCard
          label="Unidades vendidas"
          value={totalVendidas}
          hint="Histórico"
          icon={ShoppingCart}
          tone="success"
        />
        <StatCard
          label="Valor inventario"
          value={formatMoneda(valorTotalInventario)}
          hint="A precio de venta"
          icon={TrendingUp}
          tone="warning"
        />
      </div>

      {prendasBajoStock.length > 0 && (
        <Card className="border-warning/40 bg-warning/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-warning-foreground">
              <AlertCircle className="h-4 w-4" />
              Stock bajo
            </CardTitle>
            <CardDescription>
              {prendasBajoStock.length} prenda{prendasBajoStock.length > 1 ? "s necesitan" : " necesita"} reposición
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {prendasBajoStock.map((prenda) => (
                <div
                  key={prenda.id}
                  className="flex items-center justify-between rounded-md bg-background/60 px-3 py-2 text-sm"
                >
                  <span className="font-medium">{prenda.nombre}</span>
                  <Badge variant="destructive">
                    {prenda.cantidadInventario} / mín {prenda.stockMinimo}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Prendas en inventario</CardTitle>
          <CardDescription>
            {prendas.length} prenda{prendas.length !== 1 ? "s" : ""} en inventario
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Cargando inventario...
            </p>
          ) : prendas.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No hay prendas en inventario"
              description='Las prendas marcadas como "Para inventario" aparecerán aquí'
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {prendas.map((prenda) => {
                const imagenPrincipal =
                  prenda.imagenes?.find((img: any) => img.esPrincipal) || prenda.imagenes?.[0]
                const bajoStock =
                  prenda.cantidadInventario <= prenda.stockMinimo && prenda.stockMinimo > 0

                return (
                  <Card
                    key={prenda.id}
                    className="overflow-hidden transition-shadow hover:shadow-md"
                  >
                    {imagenPrincipal ? (
                      <div className="relative aspect-square bg-muted">
                        <Image
                          src={imagenPrincipal.url}
                          alt={prenda.nombre}
                          fill
                          className="object-cover"
                        />
                        {bajoStock && (
                          <Badge
                            variant="destructive"
                            className="absolute left-3 top-3 shadow-sm"
                          >
                            Stock bajo
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="flex aspect-square items-center justify-center bg-muted text-muted-foreground">
                        <Package className="h-10 w-10 opacity-40" />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{prenda.nombre}</CardTitle>
                      {prenda.talla && (
                        <CardDescription>Talla {prenda.talla}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Stock</span>
                          <span
                            className={`font-semibold tabular-nums ${
                              bajoStock ? "text-destructive" : "text-foreground"
                            }`}
                          >
                            {prenda.cantidadInventario}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Vendidas</span>
                          <span className="font-medium tabular-nums text-success">
                            {prenda.cantidadVendida}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Precio</span>
                          <span className="font-semibold tabular-nums">
                            {formatMoneda(Number(prenda.precioVentaUnitario))}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2 pt-1">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleAgregarStock(prenda)}
                          >
                            <Plus className="mr-1 h-4 w-4" />
                            Stock
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setSelectedPrenda(prenda)
                              setCantidad("")
                              setIsDialogOpen(true)
                            }}
                          >
                            <Minus className="mr-1 h-4 w-4" />
                            Vender
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDelete(prenda.id, prenda.nombre)}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Eliminar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedPrenda?.nombre}</DialogTitle>
          </DialogHeader>

          {selectedPrenda && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-border/60 bg-muted/40 p-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Stock actual
                  </p>
                  <p className="text-2xl font-semibold tabular-nums">
                    {selectedPrenda.cantidadInventario}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Vendidas
                  </p>
                  <p className="text-2xl font-semibold tabular-nums text-success">
                    {selectedPrenda.cantidadVendida}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cantidad">Cantidad</Label>
                <Input
                  id="cantidad"
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder="Ej: 5"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => handleActualizarStock("agregar")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar al stock
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleActualizarStock("vender")}
                >
                  <Minus className="mr-2 h-4 w-4" />
                  Registrar venta
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Agregar prenda al inventario</DialogTitle>
          </DialogHeader>
          <AgregarPrendaForm
            onSuccess={() => {
              setIsAddDialogOpen(false)
              fetchInventario()
            }}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
