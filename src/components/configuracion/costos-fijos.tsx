"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Trash2, DollarSign, Edit2, Check, X } from "lucide-react"

interface CostoFijo {
  id: string
  nombre: string
  monto: number
  periodicidad: string
  activo: boolean
  descripcion?: string
}

export function CostosFijos() {
  const [costos, setCostos] = useState<CostoFijo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Nuevo costo
  const [nuevoNombre, setNuevoNombre] = useState("")
  const [nuevoMonto, setNuevoMonto] = useState("")
  const [nuevaPeriodicidad, setNuevaPeriodicidad] = useState("MENSUAL")
  const [nuevaDescripcion, setNuevaDescripcion] = useState("")

  useEffect(() => {
    fetchCostos()
  }, [])

  const fetchCostos = async () => {
    try {
      const response = await fetch("/api/costos-fijos")
      if (response.ok) {
        const data = await response.json()
        setCostos(data)
      }
    } catch (error) {
      toast.error("Error al cargar costos fijos")
    } finally {
      setIsLoading(false)
    }
  }

  const agregarCosto = async () => {
    if (!nuevoNombre || !nuevoMonto) {
      toast.error("Nombre y monto son requeridos")
      return
    }

    try {
      const response = await fetch("/api/costos-fijos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nuevoNombre,
          monto: parseFloat(nuevoMonto),
          periodicidad: nuevaPeriodicidad,
          descripcion: nuevaDescripcion || null,
        }),
      })

      if (!response.ok) throw new Error("Error al crear")

      toast.success("Costo fijo agregado")
      setNuevoNombre("")
      setNuevoMonto("")
      setNuevaDescripcion("")
      fetchCostos()
    } catch (error) {
      toast.error("Error al agregar costo fijo")
    }
  }

  const eliminarCosto = async (id: string) => {
    if (!confirm("¿Eliminar este costo fijo?")) return

    try {
      const response = await fetch(`/api/costos-fijos/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar")

      toast.success("Costo fijo eliminado")
      fetchCostos()
    } catch (error) {
      toast.error("Error al eliminar costo fijo")
    }
  }

  const toggleActivo = async (id: string, activo: boolean) => {
    try {
      const response = await fetch(`/api/costos-fijos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !activo }),
      })

      if (!response.ok) throw new Error("Error al actualizar")

      toast.success(activo ? "Costo desactivado" : "Costo activado")
      fetchCostos()
    } catch (error) {
      toast.error("Error al actualizar costo")
    }
  }

  const totalMensual = costos
    .filter(c => c.activo)
    .reduce((sum, c) => {
      if (c.periodicidad === "MENSUAL") return sum + Number(c.monto)
      if (c.periodicidad === "ANUAL") return sum + (Number(c.monto) / 12)
      if (c.periodicidad === "SEMANAL") return sum + (Number(c.monto) * 4)
      return sum
    }, 0)

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-chart-4 bg-gradient-to-br from-card to-chart-4/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: 'oklch(0.55 0.12 60)' }}>
          <div className="p-2 rounded-lg" style={{ backgroundColor: 'oklch(0.75 0.12 60 / 0.2)' }}>
            <DollarSign className="h-5 w-5" style={{ color: 'oklch(0.55 0.12 60)' }} />
          </div>
          Costos Fijos
        </CardTitle>
        <CardDescription>
          Gastos recurrentes del negocio (luz, internet, alquiler, etc.)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Formulario para agregar */}
        <div className="p-4 bg-muted/30 rounded-lg space-y-3">
          <h4 className="font-semibold text-sm">Agregar Nuevo Costo</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="nombre" className="text-xs">Concepto</Label>
              <Input
                id="nombre"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                placeholder="Ej: Luz"
                className="h-9"
              />
            </div>
            <div>
              <Label htmlFor="monto" className="text-xs">Monto ($)</Label>
              <Input
                id="monto"
                type="number"
                step="0.01"
                value={nuevoMonto}
                onChange={(e) => setNuevoMonto(e.target.value)}
                placeholder="50.00"
                className="h-9"
              />
            </div>
            <div>
              <Label htmlFor="periodicidad" className="text-xs">Periodicidad</Label>
              <select
                id="periodicidad"
                value={nuevaPeriodicidad}
                onChange={(e) => setNuevaPeriodicidad(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="MENSUAL">Mensual</option>
                <option value="SEMANAL">Semanal</option>
                <option value="ANUAL">Anual</option>
              </select>
            </div>
            <div>
              <Label htmlFor="descripcion" className="text-xs">Descripción (opcional)</Label>
              <Input
                id="descripcion"
                value={nuevaDescripcion}
                onChange={(e) => setNuevaDescripcion(e.target.value)}
                placeholder="Detalles..."
                className="h-9"
              />
            </div>
          </div>
          <Button onClick={agregarCosto} size="sm" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Costo Fijo
          </Button>
        </div>

        {/* Lista de costos */}
        <div className="space-y-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">Cargando...</p>
          ) : costos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay costos fijos configurados
            </p>
          ) : (
            <>
              {costos.map((costo) => (
                <div
                  key={costo.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    costo.activo ? 'bg-background' : 'bg-muted/50 opacity-60'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{costo.nombre}</p>
                      <Badge variant={costo.activo ? "default" : "secondary"} className="text-xs">
                        {costo.periodicidad}
                      </Badge>
                    </div>
                    {costo.descripcion && (
                      <p className="text-xs text-muted-foreground mt-1">{costo.descripcion}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-lg">${Number(costo.monto).toFixed(2)}</p>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleActivo(costo.id, costo.activo)}
                        title={costo.activo ? "Desactivar" : "Activar"}
                      >
                        {costo.activo ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => eliminarCosto(costo.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total Mensual Estimado:</span>
                  <span className="text-2xl font-bold text-primary">
                    ${totalMensual.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Suma de todos los costos fijos activos convertidos a mensual
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
