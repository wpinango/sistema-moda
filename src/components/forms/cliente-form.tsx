"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const clienteSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  notas: z.string().optional(),
  medidas: z.object({
    busto: z.string().optional(),
    cintura: z.string().optional(),
    cadera: z.string().optional(),
    largoManga: z.string().optional(),
    largoTotal: z.string().optional(),
    notas: z.string().optional(),
  }).optional(),
})

type ClienteFormData = z.infer<typeof clienteSchema>

interface ClienteFormProps {
  cliente?: any
  onSuccess: () => void
  onCancel: () => void
}

export function ClienteForm({ cliente, onSuccess, onCancel }: ClienteFormProps) {
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
    defaultValues: cliente ? {
      nombre: cliente.nombre,
      email: cliente.email || "",
      telefono: cliente.telefono || "",
      direccion: cliente.direccion || "",
      notas: cliente.notas || "",
      medidas: cliente.medidas?.[0] ? {
        busto: cliente.medidas[0].busto?.toString() || "",
        cintura: cliente.medidas[0].cintura?.toString() || "",
        cadera: cliente.medidas[0].cadera?.toString() || "",
        largoManga: cliente.medidas[0].largoManga?.toString() || "",
        largoTotal: cliente.medidas[0].largoTotal?.toString() || "",
        notas: cliente.medidas[0].notas || "",
      } : undefined,
    } : undefined,
  })

  const onSubmit = async (data: ClienteFormData) => {
    setIsLoading(true)
    try {
      const url = cliente
        ? `/api/clientes/${cliente.id}`
        : "/api/clientes"
      
      const response = await fetch(url, {
        method: cliente ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error("Error al guardar cliente")

      toast.success(
        cliente ? "Cliente actualizado" : "Cliente creado",
        { description: "Los cambios se guardaron correctamente" }
      )
      onSuccess()
    } catch (error) {
      toast.error("Error", {
        description: "No se pudo guardar el cliente"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Tabs defaultValue="datos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="datos">Datos Personales</TabsTrigger>
          <TabsTrigger value="medidas">Medidas</TabsTrigger>
        </TabsList>

        <TabsContent value="datos" className="space-y-4 mt-4">
          <div>
            <Label htmlFor="nombre">Nombre Completo *</Label>
            <Input
              id="nombre"
              {...register("nombre")}
              placeholder="Ej: María García"
            />
            {errors.nombre && (
              <p className="text-sm text-destructive mt-1">{errors.nombre.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="maria@email.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                {...register("telefono")}
                placeholder="+1234567890"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              {...register("direccion")}
              placeholder="Calle Principal 123"
            />
          </div>

          <div>
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              {...register("notas")}
              placeholder="Preferencias, observaciones..."
              rows={3}
            />
          </div>
        </TabsContent>

        <TabsContent value="medidas" className="space-y-4 mt-4">
          <p className="text-sm text-muted-foreground">
            Todas las medidas en centímetros (cm)
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="busto">Busto</Label>
              <Input
                id="busto"
                type="number"
                step="0.01"
                {...register("medidas.busto")}
                placeholder="90.00"
              />
            </div>

            <div>
              <Label htmlFor="cintura">Cintura</Label>
              <Input
                id="cintura"
                type="number"
                step="0.01"
                {...register("medidas.cintura")}
                placeholder="70.00"
              />
            </div>

            <div>
              <Label htmlFor="cadera">Cadera</Label>
              <Input
                id="cadera"
                type="number"
                step="0.01"
                {...register("medidas.cadera")}
                placeholder="95.00"
              />
            </div>

            <div>
              <Label htmlFor="largoManga">Largo de Manga</Label>
              <Input
                id="largoManga"
                type="number"
                step="0.01"
                {...register("medidas.largoManga")}
                placeholder="58.00"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="largoTotal">Largo Total</Label>
              <Input
                id="largoTotal"
                type="number"
                step="0.01"
                {...register("medidas.largoTotal")}
                placeholder="150.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="medidasNotas">Notas sobre Medidas</Label>
            <Textarea
              id="medidasNotas"
              {...register("medidas.notas")}
              placeholder="Observaciones sobre las medidas..."
              rows={2}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {cliente ? "Actualizar" : "Crear"} Cliente
        </Button>
      </div>
    </form>
  )
}
