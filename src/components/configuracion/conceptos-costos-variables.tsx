"use client"

import { useEffect, useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Check, Tags, Plus, Trash2, X } from "lucide-react"

interface ConceptoCostoVariable {
  id: string
  nombre: string
  montoDefecto: string | number | null
  descripcion: string | null
  activo: boolean
}

const ACCENT_COLOR = "oklch(0.55 0.12 200)"
const ACCENT_BG = "oklch(0.75 0.12 200 / 0.2)"

export function ConceptosCostosVariables() {
  const [conceptos, setConceptos] = useState<ConceptoCostoVariable[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [nuevoNombre, setNuevoNombre] = useState("")
  const [nuevoMonto, setNuevoMonto] = useState("")
  const [nuevaDescripcion, setNuevaDescripcion] = useState("")

  useEffect(() => {
    fetchConceptos()
  }, [])

  const fetchConceptos = async () => {
    try {
      const response = await fetch("/api/conceptos-costos-variables")
      if (response.ok) {
        const data = await response.json()
        setConceptos(data)
      }
    } catch {
      toast.error("Error al cargar conceptos")
    } finally {
      setIsLoading(false)
    }
  }

  const agregarConcepto = async () => {
    if (!nuevoNombre.trim()) {
      toast.error("El nombre del concepto es requerido")
      return
    }

    try {
      const response = await fetch("/api/conceptos-costos-variables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nuevoNombre,
          montoDefecto: nuevoMonto || null,
          descripcion: nuevaDescripcion || null,
        }),
      })

      if (!response.ok) throw new Error("Error al crear")

      toast.success("Concepto agregado")
      setNuevoNombre("")
      setNuevoMonto("")
      setNuevaDescripcion("")
      fetchConceptos()
    } catch {
      toast.error("Error al agregar concepto")
    }
  }

  const eliminarConcepto = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar el concepto "${nombre}"?`)) return

    try {
      const response = await fetch(`/api/conceptos-costos-variables/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar")

      toast.success("Concepto eliminado")
      fetchConceptos()
    } catch {
      toast.error("Error al eliminar concepto")
    }
  }

  const toggleActivo = async (id: string, activo: boolean) => {
    try {
      const response = await fetch(`/api/conceptos-costos-variables/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !activo }),
      })

      if (!response.ok) throw new Error("Error al actualizar")

      toast.success(activo ? "Concepto desactivado" : "Concepto activado")
      fetchConceptos()
    } catch {
      toast.error("Error al actualizar concepto")
    }
  }

  const activos = conceptos.filter((c) => c.activo)
  const totalMontoSugerido = activos.reduce(
    (sum, c) =>
      sum +
      (c.montoDefecto !== null && c.montoDefecto !== undefined
        ? Number(c.montoDefecto)
        : 0),
    0,
  )

  return (
    <Card className="shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 border-l-chart-2 bg-gradient-to-br from-card to-chart-2/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2" style={{ color: ACCENT_COLOR }}>
          <div className="p-2 rounded-lg" style={{ backgroundColor: ACCENT_BG }}>
            <Tags className="h-5 w-5" style={{ color: ACCENT_COLOR }} />
          </div>
          Conceptos de Costos Variables
        </CardTitle>
        <CardDescription>
          Catálogo reutilizable. Aparecen en la calculadora al agregar costos a una prenda.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted/30 rounded-lg space-y-3">
          <h4 className="font-semibold text-sm">Agregar Nuevo Concepto</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="conceptoNombre" className="text-xs">
                Concepto *
              </Label>
              <Input
                id="conceptoNombre"
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                placeholder="Ej: Transporte"
                className="h-9"
              />
            </div>
            <div>
              <Label htmlFor="conceptoMonto" className="text-xs">
                Monto sugerido ($) — opcional
              </Label>
              <Input
                id="conceptoMonto"
                type="number"
                step="0.01"
                min="0"
                value={nuevoMonto}
                onChange={(e) => setNuevoMonto(e.target.value)}
                placeholder="0.00"
                className="h-9"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="conceptoDescripcion" className="text-xs">
                Descripción (opcional)
              </Label>
              <Input
                id="conceptoDescripcion"
                value={nuevaDescripcion}
                onChange={(e) => setNuevaDescripcion(e.target.value)}
                placeholder="Detalles adicionales..."
                className="h-9"
              />
            </div>
          </div>
          <Button onClick={agregarConcepto} size="sm" className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Agregar Concepto
          </Button>
        </div>

        <div className="space-y-2">
          {isLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Cargando...
            </p>
          ) : conceptos.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No hay conceptos registrados
            </p>
          ) : (
            <>
              {conceptos.map((concepto) => {
                const monto =
                  concepto.montoDefecto !== null &&
                  concepto.montoDefecto !== undefined
                    ? Number(concepto.montoDefecto)
                    : null

                return (
                  <div
                    key={concepto.id}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      concepto.activo ? "bg-background" : "bg-muted/50 opacity-60"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{concepto.nombre}</p>
                        {!concepto.activo && (
                          <Badge variant="secondary" className="text-[10px]">
                            Inactivo
                          </Badge>
                        )}
                      </div>
                      {concepto.descripcion && (
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {concepto.descripcion}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-lg tabular-nums">
                        {monto !== null ? `$${monto.toFixed(2)}` : "—"}
                      </p>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleActivo(concepto.id, concepto.activo)}
                          title={concepto.activo ? "Desactivar" : "Activar"}
                        >
                          {concepto.activo ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() =>
                            eliminarConcepto(concepto.id, concepto.nombre)
                          }
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}

              <div
                className="mt-4 p-4 rounded-lg border"
                style={{
                  borderColor: ACCENT_BG,
                  backgroundColor: "oklch(0.75 0.12 200 / 0.08)",
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Conceptos activos:</span>
                  <span
                    className="text-2xl font-bold tabular-nums"
                    style={{ color: ACCENT_COLOR }}
                  >
                    {activos.length}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Suma de montos sugeridos: ${totalMontoSugerido.toFixed(2)}
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
