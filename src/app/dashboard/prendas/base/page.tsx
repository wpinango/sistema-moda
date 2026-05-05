"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { EmptyState } from "@/components/ui/empty-state"
import { PrendaBaseForm } from "@/components/forms/prenda-base-form"
import { Plus, Pencil, Shirt, Clock, Trash2, Layers, Tag } from "lucide-react"
import { toast } from "sonner"

export default function PrendasBasePage() {
  const [prendas, setPrendas] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPrenda, setSelectedPrenda] = useState<any>(null)

  const fetchPrendas = async () => {
    try {
      const response = await fetch("/api/prendas/base")
      if (!response.ok) throw new Error("Error al cargar prendas base")
      const data = await response.json()
      setPrendas(data)
    } catch (error) {
      toast.error("Error al cargar prendas base")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPrendas()
  }, [])

  const handleEdit = (prenda: any) => {
    setSelectedPrenda(prenda)
    setIsDialogOpen(true)
  }

  const handleNew = () => {
    setSelectedPrenda(null)
    setIsDialogOpen(true)
  }

  const handleSuccess = () => {
    setIsDialogOpen(false)
    setSelectedPrenda(null)
    fetchPrendas()
  }

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar la prenda base "${nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      return
    }
    try {
      const response = await fetch(`/api/prendas/base/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Error al eliminar")
      toast.success("Prenda base eliminada", {
        description: `${nombre} ha sido eliminada correctamente`,
      })
      fetchPrendas()
    } catch (error) {
      toast.error("Error al eliminar prenda base")
    }
  }

  const prendasActivas = prendas.filter((p) => p.activo)
  const masUsada =
    prendasActivas.length > 0
      ? prendasActivas.reduce((prev, current) =>
          (current._count?.calculadas || 0) > (prev._count?.calculadas || 0) ? current : prev,
        )
      : null
  const categorias = new Set(prendasActivas.map((p) => p.categoria)).size

  return (
    <div className="space-y-8">
      <PageHeader
        title="Prendas base"
        description="Plantillas de prendas con materiales predefinidos"
        icon={Shirt}
        actions={
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva prenda base
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total plantillas"
          value={prendasActivas.length}
          hint="Prendas base activas"
          icon={Layers}
          tone="primary"
        />
        <StatCard
          label="Más usada"
          value={
            masUsada ? (
              <span className="block max-w-[16ch] truncate">{masUsada.nombre}</span>
            ) : (
              "—"
            )
          }
          hint={
            masUsada
              ? `${masUsada._count?.calculadas || 0} cálculo${masUsada._count?.calculadas === 1 ? "" : "s"}`
              : "Sin datos"
          }
          icon={Shirt}
          tone="info"
        />
        <StatCard
          label="Categorías"
          value={categorias}
          hint="Tipos diferentes"
          icon={Tag}
          tone="success"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plantillas de prendas</CardTitle>
          <CardDescription>
            {prendasActivas.length} plantilla{prendasActivas.length !== 1 ? "s" : ""} activa
            {prendasActivas.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Cargando prendas base...
            </p>
          ) : prendas.length === 0 ? (
            <EmptyState
              icon={Shirt}
              title="No hay prendas base"
              description="Comienza creando tu primera plantilla de prenda"
              action={
                <Button onClick={handleNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear prenda base
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {prendas.map((prenda) => (
                <Card key={prenda.id} className="transition-shadow hover:shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <CardTitle className="text-base">{prenda.nombre}</CardTitle>
                        <CardDescription className="mt-1 line-clamp-2">
                          {prenda.descripcion || "Sin descripción"}
                        </CardDescription>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(prenda)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(prenda.id, prenda.nombre)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      <Badge variant="secondary">{prenda.categoria}</Badge>
                      <Badge variant="outline">{prenda.complejidad}</Badge>
                      {!prenda.activo && (
                        <Badge variant="destructive">Inactiva</Badge>
                      )}
                    </div>

                    <div className="space-y-1.5 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{prenda.tiempoEstimadoMin} min</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Layers className="h-3.5 w-3.5" />
                        <span>{prenda.materiales?.length || 0} materiales</span>
                      </div>
                      {prenda._count && prenda._count.calculadas > 0 && (
                        <div className="text-xs">
                          Usada {prenda._count.calculadas} vec
                          {prenda._count.calculadas === 1 ? "" : "es"}
                        </div>
                      )}
                    </div>

                    {prenda.materiales?.length > 0 && (
                      <div className="rounded-md border border-border/60 bg-muted/40 p-2.5">
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Materiales
                        </p>
                        <div className="space-y-0.5 text-xs">
                          {prenda.materiales.slice(0, 3).map((m: any) => (
                            <div
                              key={m.id}
                              className="flex justify-between gap-2 text-muted-foreground"
                            >
                              <span className="truncate">{m.material.nombre}</span>
                              <span className="shrink-0 tabular-nums">
                                {Number(m.cantidad)} {m.material.unidadMedida}
                              </span>
                            </div>
                          ))}
                          {prenda.materiales.length > 3 && (
                            <p className="text-muted-foreground">
                              +{prenda.materiales.length - 3} más...
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-border/60 pt-3 text-sm">
                      <span className="text-muted-foreground">Margen sugerido</span>
                      <span className="font-semibold tabular-nums">
                        {Number(prenda.margenSugeridoPct)}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPrenda ? "Editar prenda base" : "Nueva prenda base"}
            </DialogTitle>
          </DialogHeader>
          <PrendaBaseForm
            prenda={selectedPrenda}
            onSuccess={handleSuccess}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
