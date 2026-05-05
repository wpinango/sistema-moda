"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { EmptyState } from "@/components/ui/empty-state"
import { MaterialForm } from "@/components/forms/material-form"
import { formatMoneda } from "@/lib/utils"
import { Plus, Pencil, AlertCircle, Package, Trash2 } from "lucide-react"
import { toast } from "sonner"

export default function MaterialesPage() {
  const [materiales, setMateriales] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null)

  const fetchMateriales = async () => {
    try {
      const response = await fetch("/api/materiales")
      if (!response.ok) throw new Error("Error al cargar materiales")
      const data = await response.json()
      setMateriales(data)
    } catch (error) {
      toast.error("Error al cargar materiales")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMateriales()
  }, [])

  const handleEdit = (material: any) => {
    setSelectedMaterial(material)
    setIsDialogOpen(true)
  }

  const handleNew = () => {
    setSelectedMaterial(null)
    setIsDialogOpen(true)
  }

  const handleSuccess = () => {
    setIsDialogOpen(false)
    setSelectedMaterial(null)
    fetchMateriales()
  }

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar el material "${nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      return
    }

    try {
      const response = await fetch(`/api/materiales/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Error al eliminar")
      toast.success("Material eliminado", { description: `${nombre} eliminado correctamente` })
      fetchMateriales()
    } catch (error) {
      toast.error("Error al eliminar material")
    }
  }

  const materialesBajoStock = materiales.filter(
    (m) => m.activo && Number(m.stockActual) <= Number(m.stockMinimo),
  )
  const materialesActivos = materiales.filter((m) => m.activo)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Materiales"
        description="Gestiona tu inventario de materiales y proveedores"
        icon={Package}
        actions={
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo material
          </Button>
        }
      />

      {materialesBajoStock.length > 0 && (
        <Card className="border-warning/40 bg-warning/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-warning-foreground">
              <AlertCircle className="h-4 w-4" />
              Stock bajo
            </CardTitle>
            <CardDescription>
              {materialesBajoStock.length} material
              {materialesBajoStock.length > 1 ? "es necesitan" : " necesita"} reposición
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {materialesBajoStock.map((material) => (
                <div
                  key={material.id}
                  className="flex items-center justify-between rounded-md bg-background/60 px-3 py-2 text-sm"
                >
                  <span className="font-medium">{material.nombre}</span>
                  <Badge variant="destructive" className="font-medium">
                    {Number(material.stockActual)} {material.unidadMedida}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Inventario de materiales</CardTitle>
          <CardDescription>
            {materialesActivos.length} material{materialesActivos.length !== 1 ? "es" : ""} activo
            {materialesActivos.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          {isLoading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Cargando materiales...
            </p>
          ) : materiales.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No hay materiales"
              description="Comienza agregando tu primer material al inventario"
              action={
                <Button onClick={handleNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar material
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-muted/40 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 text-left">Nombre</th>
                    <th className="px-4 py-3 text-left">Tipo</th>
                    <th className="px-4 py-3 text-left">Color</th>
                    <th className="px-4 py-3 text-right">Stock</th>
                    <th className="px-4 py-3 text-right">Costo</th>
                    <th className="px-4 py-3 text-left">Proveedor</th>
                    <th className="px-4 py-3 text-center">Estado</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {materiales.map((material) => {
                    const bajoStock =
                      Number(material.stockActual) <= Number(material.stockMinimo)
                    return (
                      <tr
                        key={material.id}
                        className="border-b border-border/40 transition-colors last:border-0 hover:bg-muted/40"
                      >
                        <td className="px-4 py-3 font-medium text-foreground">
                          {material.nombre}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="font-normal">
                            {material.tipo}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {material.color || "—"}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">
                          <div className="flex flex-col items-end leading-tight">
                            <span
                              className={
                                bajoStock
                                  ? "font-semibold text-destructive"
                                  : "font-medium text-foreground"
                              }
                            >
                              {Number(material.stockActual)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {material.unidadMedida}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium tabular-nums">
                          {formatMoneda(Number(material.costoUnitario))}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {material.proveedor || "—"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant={material.activo ? "secondary" : "outline"}>
                            {material.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(material)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(material.id, material.nombre)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedMaterial ? "Editar material" : "Nuevo material"}
            </DialogTitle>
          </DialogHeader>
          <MaterialForm
            material={selectedMaterial}
            onSuccess={handleSuccess}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
