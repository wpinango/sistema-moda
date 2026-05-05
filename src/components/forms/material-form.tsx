"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const materialSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  tipo: z.string().min(1, "El tipo es requerido"),
  unidadMedida: z.string().min(1, "La unidad de medida es requerida"),
  color: z.string().optional(),
  stockActual: z.string().min(0, "El stock debe ser mayor o igual a 0"),
  stockMinimo: z.string().min(0, "El stock mínimo debe ser mayor o igual a 0"),
  costoUnitario: z.string().min(0, "El costo debe ser mayor o igual a 0"),
  proveedor: z.string().optional(),
  notas: z.string().optional(),
})

type MaterialFormData = z.infer<typeof materialSchema>

interface MaterialFormProps {
  material?: any
  onSuccess: () => void
  onCancel: () => void
}

const TIPOS_MATERIAL = [
  "TELA",
  "HILO",
  "BOTON",
  "CREMALLERA",
  "ADORNO",
  "OTRO"
]

const UNIDADES_MEDIDA = [
  "METRO",
  "UNIDAD",
  "GRAMO",
  "ROLLO"
]

export function MaterialForm({ material, onSuccess, onCancel }: MaterialFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
    defaultValues: material ? {
      nombre: material.nombre,
      tipo: material.tipo,
      unidadMedida: material.unidadMedida,
      color: material.color || "",
      stockActual: material.stockActual?.toString() || "0",
      stockMinimo: material.stockMinimo?.toString() || "0",
      costoUnitario: material.costoUnitario?.toString() || "0",
      proveedor: material.proveedor || "",
      notas: material.notas || "",
    } : {
      stockActual: "0",
      stockMinimo: "0",
      costoUnitario: "0",
    },
  })

  const onSubmit = async (data: MaterialFormData) => {
    setIsLoading(true)
    try {
      const url = material
        ? `/api/materiales/${material.id}`
        : "/api/materiales"
      
      const response = await fetch(url, {
        method: material ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Error al guardar material")

      toast.success(
        material ? "Material actualizado" : "Material creado",
        { description: "Los cambios se guardaron correctamente" }
      )
      onSuccess()
    } catch (error) {
      toast.error("Error", {
        description: "No se pudo guardar el material"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="nombre">Nombre *</Label>
          <Input
            id="nombre"
            {...register("nombre")}
            placeholder="Ej: Seda natural blanca"
          />
          {errors.nombre && (
            <p className="text-sm text-destructive mt-1">{errors.nombre.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="tipo">Tipo *</Label>
          <select
            id="tipo"
            {...register("tipo")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Seleccionar...</option>
            {TIPOS_MATERIAL.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
          {errors.tipo && (
            <p className="text-sm text-destructive mt-1">{errors.tipo.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="unidadMedida">Unidad de Medida *</Label>
          <select
            id="unidadMedida"
            {...register("unidadMedida")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Seleccionar...</option>
            {UNIDADES_MEDIDA.map((unidad) => (
              <option key={unidad} value={unidad}>
                {unidad}
              </option>
            ))}
          </select>
          {errors.unidadMedida && (
            <p className="text-sm text-destructive mt-1">{errors.unidadMedida.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="color">Color</Label>
          <Input
            id="color"
            {...register("color")}
            placeholder="Ej: Blanco"
          />
        </div>

        <div>
          <Label htmlFor="proveedor">Proveedor</Label>
          <Input
            id="proveedor"
            {...register("proveedor")}
            placeholder="Ej: Telas Premium SA"
          />
        </div>

        <div>
          <Label htmlFor="stockActual">Stock Actual *</Label>
          <Input
            id="stockActual"
            type="number"
            step="0.001"
            {...register("stockActual")}
          />
          {errors.stockActual && (
            <p className="text-sm text-destructive mt-1">{errors.stockActual.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="stockMinimo">Stock Mínimo *</Label>
          <Input
            id="stockMinimo"
            type="number"
            step="0.001"
            {...register("stockMinimo")}
          />
          {errors.stockMinimo && (
            <p className="text-sm text-destructive mt-1">{errors.stockMinimo.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="costoUnitario">Costo Unitario *</Label>
          <Input
            id="costoUnitario"
            type="number"
            step="0.01"
            {...register("costoUnitario")}
            placeholder="0.00"
          />
          {errors.costoUnitario && (
            <p className="text-sm text-destructive mt-1">{errors.costoUnitario.message}</p>
          )}
        </div>

        <div className="col-span-2">
          <Label htmlFor="notas">Notas</Label>
          <textarea
            id="notas"
            {...register("notas")}
            placeholder="Notas adicionales..."
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {material ? "Actualizar" : "Crear"} Material
        </Button>
      </div>
    </form>
  )
}
