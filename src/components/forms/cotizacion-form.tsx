"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { formatMoneda } from "@/lib/utils"

const cotizacionSchema = z.object({
  clienteId: z.string().min(1, "Selecciona un cliente"),
  prendaCalculadaId: z.string().optional(),
  fechaEntrega: z.string().optional(),
  subtotal: z.string().min(1, "El subtotal es requerido"),
  descuento: z.string().optional(),
  total: z.string().min(1, "El total es requerido"),
  notas: z.string().optional(),
})

type CotizacionFormData = z.infer<typeof cotizacionSchema>

interface CotizacionFormProps {
  cotizacion?: any
  onSuccess: () => void
  onCancel: () => void
}

export function CotizacionForm({ cotizacion, onSuccess, onCancel }: CotizacionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [clientes, setClientes] = useState<any[]>([])
  const [prendasCalculadas, setPrendasCalculadas] = useState<any[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [descuento, setDescuento] = useState(0)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CotizacionFormData>({
    resolver: zodResolver(cotizacionSchema),
    defaultValues: cotizacion ? {
      clienteId: cotizacion.clienteId,
      prendaCalculadaId: cotizacion.prendaCalculadaId || "",
      fechaEntrega: cotizacion.fechaEntrega 
        ? new Date(cotizacion.fechaEntrega).toISOString().split('T')[0]
        : "",
      subtotal: cotizacion.subtotal?.toString(),
      descuento: cotizacion.descuento?.toString() || "0",
      total: cotizacion.total?.toString(),
      notas: cotizacion.notas || "",
    } : {
      descuento: "0",
    },
  })

  const clienteId = watch("clienteId")
  const prendaCalculadaId = watch("prendaCalculadaId")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesRes, prendasRes] = await Promise.all([
          fetch("/api/clientes"),
          fetch("/api/prendas/calculadas"),
        ])

        if (clientesRes.ok) setClientes(await clientesRes.json())
        if (prendasRes.ok) setPrendasCalculadas(await prendasRes.json())
      } catch (error) {
        console.error("Error al cargar datos:", error)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (prendaCalculadaId) {
      const prenda = prendasCalculadas.find(p => p.id === prendaCalculadaId)
      if (prenda) {
        const precio = Number(prenda.precioVentaUnitario)
        setSubtotal(precio)
        setValue("subtotal", precio.toString())
        calcularTotal(precio, descuento)
      }
    }
  }, [prendaCalculadaId, prendasCalculadas, setValue])

  const calcularTotal = (sub: number, desc: number) => {
    const total = sub - desc
    setValue("total", total.toString())
  }

  const handleSubtotalChange = (value: string) => {
    const sub = parseFloat(value) || 0
    setSubtotal(sub)
    calcularTotal(sub, descuento)
  }

  const handleDescuentoChange = (value: string) => {
    const desc = parseFloat(value) || 0
    setDescuento(desc)
    calcularTotal(subtotal, desc)
  }

  const onSubmit = async (data: CotizacionFormData) => {
    setIsLoading(true)
    try {
      const url = cotizacion
        ? `/api/cotizaciones/${cotizacion.id}`
        : "/api/cotizaciones"
      
      const response = await fetch(url, {
        method: cotizacion ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Error al guardar cotización")

      toast.success(
        cotizacion ? "Cotización actualizada" : "Cotización creada",
        { description: "Los cambios se guardaron correctamente" }
      )
      onSuccess()
    } catch (error) {
      toast.error("Error", {
        description: "No se pudo guardar la cotización"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="clienteId">Cliente *</Label>
          <select
            id="clienteId"
            {...register("clienteId")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Seleccionar cliente...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          {errors.clienteId && (
            <p className="text-sm text-destructive mt-1">{errors.clienteId.message}</p>
          )}
        </div>

        <div className="col-span-2">
          <Label htmlFor="prendaCalculadaId">Prenda Calculada (opcional)</Label>
          <select
            id="prendaCalculadaId"
            {...register("prendaCalculadaId")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Sin prenda asociada</option>
            {prendasCalculadas
              .filter(p => !clienteId || p.clienteId === clienteId)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} - {formatMoneda(Number(p.precioVentaUnitario))}
                </option>
              ))}
          </select>
        </div>

        <div className="col-span-2">
          <Label htmlFor="fechaEntrega">Fecha de Entrega</Label>
          <Input
            id="fechaEntrega"
            type="date"
            {...register("fechaEntrega")}
          />
        </div>

        <div>
          <Label htmlFor="subtotal">Subtotal *</Label>
          <Input
            id="subtotal"
            type="number"
            step="0.01"
            {...register("subtotal")}
            onChange={(e) => handleSubtotalChange(e.target.value)}
            placeholder="0.00"
          />
          {errors.subtotal && (
            <p className="text-sm text-destructive mt-1">{errors.subtotal.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="descuento">Descuento</Label>
          <Input
            id="descuento"
            type="number"
            step="0.01"
            {...register("descuento")}
            onChange={(e) => handleDescuentoChange(e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="total">Total *</Label>
          <Input
            id="total"
            type="number"
            step="0.01"
            {...register("total")}
            readOnly
            className="bg-muted font-bold text-lg"
          />
          {errors.total && (
            <p className="text-sm text-destructive mt-1">{errors.total.message}</p>
          )}
        </div>

        <div className="col-span-2">
          <Label htmlFor="notas">Notas</Label>
          <Textarea
            id="notas"
            {...register("notas")}
            placeholder="Observaciones, condiciones especiales..."
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
          {cotizacion ? "Actualizar" : "Crear"} Cotización
        </Button>
      </div>
    </form>
  )
}
