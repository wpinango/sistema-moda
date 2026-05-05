"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/ui/page-header"
import { CostosFijos } from "@/components/configuracion/costos-fijos"
import { Settings, DollarSign, TrendingUp, Save, Sparkles } from "lucide-react"
import { toast } from "sonner"

export default function ConfiguracionPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [costoManoObraHora, setCostoManoObraHora] = useState("15")
  const [porcentajeCostosIndirectos, setPorcentajeCostosIndirectos] = useState("20")
  const [margenGananciaPorDefecto, setMargenGananciaPorDefecto] = useState("40")
  const [descuentoDocena, setDescuentoDocena] = useState("15")

  useEffect(() => {
    fetchConfiguracion()
  }, [])

  const fetchConfiguracion = async () => {
    try {
      const response = await fetch("/api/configuracion")
      if (response.ok) {
        const configs = await response.json()
        configs.forEach((config: any) => {
          switch (config.clave) {
            case "costo_mano_obra_hora":
              setCostoManoObraHora(config.valor)
              break
            case "porcentaje_costos_indirectos":
              setPorcentajeCostosIndirectos(config.valor)
              break
            case "margen_ganancia_defecto":
              setMargenGananciaPorDefecto(config.valor)
              break
            case "descuento_docena":
              setDescuentoDocena(config.valor)
              break
          }
        })
      }
    } catch (error) {
      console.error("Error al cargar configuración:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const guardarConfiguracion = async () => {
    setIsSaving(true)
    try {
      const configuraciones = [
        { clave: "costo_mano_obra_hora", valor: costoManoObraHora },
        { clave: "porcentaje_costos_indirectos", valor: porcentajeCostosIndirectos },
        { clave: "margen_ganancia_defecto", valor: margenGananciaPorDefecto },
        { clave: "descuento_docena", valor: descuentoDocena },
      ]
      const response = await fetch("/api/configuracion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configuraciones }),
      })
      if (!response.ok) throw new Error("Error al guardar")
      toast.success("Configuración guardada", {
        description: "Los cambios se aplicarán en los próximos cálculos",
      })
    } catch (error) {
      toast.error("Error al guardar la configuración")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando configuración...</p>
      </div>
    )
  }

  // Cálculos para vista previa
  const costoManoObra = parseFloat(costoManoObraHora) || 0
  const indirectosPct = parseFloat(porcentajeCostosIndirectos) || 0
  const margenPct = parseFloat(margenGananciaPorDefecto) || 0
  const materialesEjemplo = 50
  const indirectos = (materialesEjemplo + costoManoObra) * (indirectosPct / 100)
  const costoTotal = materialesEjemplo + costoManoObra + indirectos
  const precioVenta = costoTotal * (1 + margenPct / 100)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Configuración"
        description="Ajusta los parámetros de cálculo de costos del sistema"
        icon={Settings}
        actions={
          <>
            <Button variant="outline" onClick={fetchConfiguracion}>
              Restablecer
            </Button>
            <Button onClick={guardarConfiguracion} disabled={isSaving}>
              <Save className={`mr-2 h-4 w-4 ${isSaving ? "animate-pulse" : ""}`} />
              Guardar
            </Button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              Costos de producción
            </CardTitle>
            <CardDescription>Configura los costos fijos y variables</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="costoManoObra">Costo de mano de obra por hora ($)</Label>
              <Input
                id="costoManoObra"
                type="number"
                step="0.01"
                value={costoManoObraHora}
                onChange={(e) => setCostoManoObraHora(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Valor actual: ${costoManoObraHora}/hora
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="costosIndirectos">Costos indirectos (%)</Label>
              <Input
                id="costosIndirectos"
                type="number"
                step="0.01"
                value={porcentajeCostosIndirectos}
                onChange={(e) => setPorcentajeCostosIndirectos(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Porcentaje sobre materiales + mano de obra. Incluye luz, agua, alquiler, herramientas.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Márgenes y descuentos
            </CardTitle>
            <CardDescription>Configura los márgenes de ganancia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="margenDefecto">Margen de ganancia por defecto (%)</Label>
              <Input
                id="margenDefecto"
                type="number"
                step="0.01"
                value={margenGananciaPorDefecto}
                onChange={(e) => setMargenGananciaPorDefecto(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Se aplicará automáticamente en la calculadora
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="descuentoDocena">Descuento por docena (%)</Label>
              <Input
                id="descuentoDocena"
                type="number"
                step="0.01"
                value={descuentoDocena}
                onChange={(e) => setDescuentoDocena(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Descuento aplicado al precio por docena
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            Vista previa del cálculo
          </CardTitle>
          <CardDescription>
            Ejemplo con $50 de materiales y 60 minutos de trabajo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mano de obra (60 min)</span>
              <span className="font-medium tabular-nums">${costoManoObra.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Materiales</span>
              <span className="font-medium tabular-nums">$50.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Costos indirectos ({indirectosPct}%)
              </span>
              <span className="font-medium tabular-nums">${indirectos.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium">
              <span>Costo total</span>
              <span className="tabular-nums">${costoTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-success">
                Precio de venta (+ {margenPct}% margen)
              </span>
              <span className="font-semibold tabular-nums text-success">
                ${precioVenta.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <CostosFijos />
    </div>
  )
}
