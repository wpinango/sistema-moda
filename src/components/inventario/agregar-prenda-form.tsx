"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const prendaInventarioSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  talla: z.string().optional(),
  precioVentaUnitario: z.string().min(1, "El precio es requerido"),
  costoTotalUnitario: z.string().optional(),
  cantidadInventario: z.string().min(1, "La cantidad es requerida"),
  stockMinimo: z.string().optional(),
  notasTecnicas: z.string().optional(),
})

type PrendaInventarioFormData = z.infer<typeof prendaInventarioSchema>

interface AgregarPrendaFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function AgregarPrendaForm({ onSuccess, onCancel }: AgregarPrendaFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PrendaInventarioFormData>({
    resolver: zodResolver(prendaInventarioSchema),
  })

  const onSubmit = async (data: PrendaInventarioFormData) => {
    setIsLoading(true)
    try {
      const precioVenta = parseFloat(data.precioVentaUnitario)
      const costoTotal = data.costoTotalUnitario 
        ? parseFloat(data.costoTotalUnitario) 
        : precioVenta * 0.6 // Si no hay costo, asume 40% de margen

      const margen = ((precioVenta - costoTotal) / costoTotal) * 100

      const response = await fetch("/api/prendas/calculadas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: data.nombre,
          talla: data.talla || null,
          costoMateriales: 0,
          costoManoObra: 0,
          costosIndirectos: 0,
          costoTotalUnitario: costoTotal,
          precioVentaUnitario: precioVenta,
          precioVentaDocena: precioVenta * 12 * 0.85, // 15% descuento
          margenAplicadoPct: margen,
          tiempoRealMin: null,
          notasTecnicas: data.notasTecnicas || null,
          esReferencia: false,
          esParaInventario: true,
          cantidadInventario: parseInt(data.cantidadInventario),
          stockMinimo: data.stockMinimo ? parseInt(data.stockMinimo) : 0,
          materiales: [],
        }),
      })

      if (!response.ok) throw new Error("Error al guardar")

      toast.success("Prenda agregada al inventario", {
        description: `${data.cantidadInventario} unidad(es) de ${data.nombre}`
      })
      onSuccess()
    } catch (error) {
      toast.error("Error", {
        description: "No se pudo agregar la prenda al inventario"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="nombre">Nombre de la Prenda *</Label>
          <Input
            id="nombre"
            {...register("nombre")}
            placeholder="Ej: Blusa Roja Talla M"
          />
          {errors.nombre && (
            <p className="text-sm text-destructive mt-1">{errors.nombre.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="talla">Talla</Label>
          <Input
            id="talla"
            {...register("talla")}
            placeholder="S, M, L, XL..."
          />
        </div>

        <div>
          <Label htmlFor="cantidadInventario">Cantidad Inicial *</Label>
          <Input
            id="cantidadInventario"
            type="number"
            min="1"
            {...register("cantidadInventario")}
            placeholder="10"
          />
          {errors.cantidadInventario && (
            <p className="text-sm text-destructive mt-1">{errors.cantidadInventario.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="precioVentaUnitario">Precio de Venta Unitario *</Label>
          <Input
            id="precioVentaUnitario"
            type="number"
            step="0.01"
            min="0"
            {...register("precioVentaUnitario")}
            placeholder="50.00"
          />
          {errors.precioVentaUnitario && (
            <p className="text-sm text-destructive mt-1">{errors.precioVentaUnitario.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="costoTotalUnitario">Costo Unitario (opcional)</Label>
          <Input
            id="costoTotalUnitario"
            type="number"
            step="0.01"
            min="0"
            {...register("costoTotalUnitario")}
            placeholder="30.00"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Si no lo sabes, déjalo vacío
          </p>
        </div>

        <div>
          <Label htmlFor="stockMinimo">Stock Mínimo</Label>
          <Input
            id="stockMinimo"
            type="number"
            min="0"
            {...register("stockMinimo")}
            placeholder="5"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Para alertas de stock bajo
          </p>
        </div>

        <div className="col-span-2">
          <Label htmlFor="notasTecnicas">Notas / Descripción</Label>
          <Textarea
            id="notasTecnicas"
            {...register("notasTecnicas")}
            placeholder="Color, material, proveedor, etc..."
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Agregar al Inventario
        </Button>
      </div>
    </form>
  )
}
