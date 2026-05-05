"use client"

import { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Plus, Trash2 } from "lucide-react"

const prendaBaseSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  categoria: z.string().min(1, "La categoría es requerida"),
  complejidad: z.string().min(1, "La complejidad es requerida"),
  tiempoEstimadoMin: z.string().min(1, "El tiempo estimado es requerido"),
  margenSugeridoPct: z.string().min(1, "El margen es requerido"),
  descripcion: z.string().optional(),
  instrucciones: z.string().optional(),
  materiales: z.array(z.object({
    materialId: z.string().min(1, "Selecciona un material"),
    cantidad: z.string().min(1, "La cantidad es requerida"),
    esObligatorio: z.boolean(),
    notas: z.string().optional(),
  })).min(1, "Agrega al menos un material"),
})

type PrendaBaseFormData = z.infer<typeof prendaBaseSchema>

interface PrendaBaseFormProps {
  prenda?: any
  onSuccess: () => void
  onCancel: () => void
}

const CATEGORIAS = ["BLUSA", "PANTALON", "VESTIDO", "FALDA", "SACO", "OTRO"]
const COMPLEJIDADES = ["BAJA", "MEDIA", "ALTA"]

export function PrendaBaseForm({ prenda, onSuccess, onCancel }: PrendaBaseFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [materiales, setMateriales] = useState<any[]>([])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PrendaBaseFormData>({
    resolver: zodResolver(prendaBaseSchema),
    defaultValues: prenda ? {
      nombre: prenda.nombre,
      categoria: prenda.categoria,
      complejidad: prenda.complejidad,
      tiempoEstimadoMin: prenda.tiempoEstimadoMin?.toString(),
      margenSugeridoPct: prenda.margenSugeridoPct?.toString(),
      descripcion: prenda.descripcion || "",
      instrucciones: prenda.instrucciones || "",
      materiales: prenda.materiales?.map((m: any) => ({
        materialId: m.materialId,
        cantidad: m.cantidad?.toString(),
        esObligatorio: m.esObligatorio ?? true,
        notas: m.notas || "",
      })) || [{ materialId: "", cantidad: "", esObligatorio: true, notas: "" }],
    } : {
      tiempoEstimadoMin: "60",
      margenSugeridoPct: "40",
      materiales: [{ materialId: "", cantidad: "", esObligatorio: true, notas: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "materiales",
  })

  useEffect(() => {
    const fetchMateriales = async () => {
      try {
        const response = await fetch("/api/materiales?activo=true")
        if (response.ok) {
          const data = await response.json()
          setMateriales(data)
        }
      } catch (error) {
        console.error("Error al cargar materiales:", error)
      }
    }
    fetchMateriales()
  }, [])

  const onSubmit = async (data: PrendaBaseFormData) => {
    setIsLoading(true)
    try {
      const url = prenda
        ? `/api/prendas/base/${prenda.id}`
        : "/api/prendas/base"
      
      const response = await fetch(url, {
        method: prenda ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Error al guardar prenda base")

      toast.success(
        prenda ? "Prenda base actualizada" : "Prenda base creada",
        { description: "Los cambios se guardaron correctamente" }
      )
      onSuccess()
    } catch (error) {
      toast.error("Error", {
        description: "No se pudo guardar la prenda base"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="nombre">Nombre de la Prenda *</Label>
          <Input
            id="nombre"
            {...register("nombre")}
            placeholder="Ej: Blusa manga larga seda"
          />
          {errors.nombre && (
            <p className="text-sm text-destructive mt-1">{errors.nombre.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="categoria">Categoría *</Label>
            <select
              id="categoria"
              {...register("categoria")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Seleccionar...</option>
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.categoria && (
              <p className="text-sm text-destructive mt-1">{errors.categoria.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="complejidad">Complejidad *</Label>
            <select
              id="complejidad"
              {...register("complejidad")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Seleccionar...</option>
              {COMPLEJIDADES.map((comp) => (
                <option key={comp} value={comp}>{comp}</option>
              ))}
            </select>
            {errors.complejidad && (
              <p className="text-sm text-destructive mt-1">{errors.complejidad.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="tiempoEstimadoMin">Tiempo Estimado (minutos) *</Label>
            <Input
              id="tiempoEstimadoMin"
              type="number"
              {...register("tiempoEstimadoMin")}
              placeholder="180"
            />
            {errors.tiempoEstimadoMin && (
              <p className="text-sm text-destructive mt-1">{errors.tiempoEstimadoMin.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="margenSugeridoPct">Margen Sugerido (%)*</Label>
            <Input
              id="margenSugeridoPct"
              type="number"
              step="0.01"
              {...register("margenSugeridoPct")}
              placeholder="40"
            />
            {errors.margenSugeridoPct && (
              <p className="text-sm text-destructive mt-1">{errors.margenSugeridoPct.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="descripcion">Descripción</Label>
          <Textarea
            id="descripcion"
            {...register("descripcion")}
            placeholder="Descripción breve de la prenda..."
            rows={2}
          />
        </div>

        <div>
          <Label htmlFor="instrucciones">Instrucciones de Confección</Label>
          <Textarea
            id="instrucciones"
            {...register("instrucciones")}
            placeholder="Pasos detallados para confeccionar..."
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base">Materiales Necesarios *</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ materialId: "", cantidad: "", esObligatorio: true, notas: "" })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar Material
          </Button>
        </div>

        {errors.materiales && typeof errors.materiales.message === 'string' && (
          <p className="text-sm text-destructive">{errors.materiales.message}</p>
        )}

        <div className="space-y-3">
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2 items-start p-3 border rounded-lg">
              <div className="flex-1 grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor={`materiales.${index}.materialId`} className="text-xs">
                    Material
                  </Label>
                  <select
                    {...register(`materiales.${index}.materialId`)}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Seleccionar...</option>
                    {materiales.map((mat) => (
                      <option key={mat.id} value={mat.id}>
                        {mat.nombre} ({mat.unidadMedida})
                      </option>
                    ))}
                  </select>
                  {errors.materiales?.[index]?.materialId && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.materiales[index]?.materialId?.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor={`materiales.${index}.cantidad`} className="text-xs">
                    Cantidad
                  </Label>
                  <Input
                    type="number"
                    step="0.001"
                    {...register(`materiales.${index}.cantidad`)}
                    placeholder="1.5"
                    className="h-9"
                  />
                  {errors.materiales?.[index]?.cantidad && (
                    <p className="text-xs text-destructive mt-1">
                      {errors.materiales[index]?.cantidad?.message}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-6"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {prenda ? "Actualizar" : "Crear"} Prenda Base
        </Button>
      </div>
    </form>
  )
}
