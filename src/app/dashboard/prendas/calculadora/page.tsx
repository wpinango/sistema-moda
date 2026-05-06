"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { PageHeader } from "@/components/ui/page-header"
import { calcularCostosPrenda, sugerirPrecioCompetitivo } from "@/lib/calculadora"
import { formatMoneda } from "@/lib/utils"
import { toast } from "sonner"
import {
  Calculator,
  Plus,
  Trash2,
  Save,
  TrendingUp,
  Package,
  DollarSign,
} from "lucide-react"

interface MaterialSeleccionado {
  materialId: string
  nombre: string
  cantidad: number
  costoUnitario: number
  unidad: string
}

interface CostoVariable {
  conceptoId: string
  concepto: string
  monto: number
  descripcion?: string
}

interface ConceptoCatalogo {
  id: string
  nombre: string
  montoDefecto: number | string | null
  descripcion: string | null
}

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"

export default function CalculadoraPage() {
  const [nombre, setNombre] = useState("")
  const [prendaBaseId, setPrendaBaseId] = useState("")
  const [clienteId, setClienteId] = useState("")
  const [talla, setTalla] = useState("")
  const [costoManoObra, setCostoManoObra] = useState("")
  const [margenPorcentaje, setMargenPorcentaje] = useState(40)
  const [esParaInventario, setEsParaInventario] = useState(false)
  const [cantidadInventario, setCantidadInventario] = useState(0)
  const [stockMinimo, setStockMinimo] = useState(0)

  const [materialesDisponibles, setMaterialesDisponibles] = useState<any[]>([])
  const [prendasBase, setPrendasBase] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [conceptosCatalogo, setConceptosCatalogo] = useState<ConceptoCatalogo[]>([])
  const [materialesSeleccionados, setMaterialesSeleccionados] = useState<MaterialSeleccionado[]>([])
  const [costosVariables, setCostosVariables] = useState<CostoVariable[]>([])

  const [resultado, setResultado] = useState<any>(null)
  const [sugerencias, setSugerencias] = useState<any[]>([])
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchData()
    cargarConfiguracion()
  }, [])

  const cargarConfiguracion = async () => {
    try {
      const response = await fetch("/api/configuracion")
      if (response.ok) {
        const configs = await response.json()
        configs.forEach((config: any) => {
          if (config.clave === "margen_ganancia_defecto") {
            setMargenPorcentaje(parseFloat(config.valor))
          }
        })
      }
    } catch (error) {
      console.error("Error al cargar configuración:", error)
    }
  }

  const fetchData = async () => {
    try {
      const [materialesRes, prendasRes, clientesRes, conceptosRes] = await Promise.all([
        fetch("/api/materiales?activo=true"),
        fetch("/api/prendas/base?activo=true"),
        fetch("/api/clientes"),
        fetch("/api/conceptos-costos-variables?activo=true"),
      ])
      if (materialesRes.ok) setMaterialesDisponibles(await materialesRes.json())
      if (prendasRes.ok) setPrendasBase(await prendasRes.json())
      if (clientesRes.ok) setClientes(await clientesRes.json())
      if (conceptosRes.ok) setConceptosCatalogo(await conceptosRes.json())
    } catch (error) {
      toast.error("Error al cargar datos")
    }
  }

  const handlePrendaBaseChange = (id: string) => {
    setPrendaBaseId(id)
    const prenda = prendasBase.find((p) => p.id === id)
    if (prenda) {
      setNombre(prenda.nombre)
      setMargenPorcentaje(Number(prenda.margenSugeridoPct))
      const materiales = prenda.materiales.map((m: any) => ({
        materialId: m.materialId,
        nombre: m.material.nombre,
        cantidad: Number(m.cantidad),
        costoUnitario: Number(m.material.costoUnitario),
        unidad: m.material.unidadMedida,
      }))
      setMaterialesSeleccionados(materiales)
    }
  }

  const agregarMaterial = () => {
    setMaterialesSeleccionados([
      ...materialesSeleccionados,
      { materialId: "", nombre: "", cantidad: 0, costoUnitario: 0, unidad: "" },
    ])
  }

  const actualizarMaterial = (index: number, field: string, value: any) => {
    const nuevos = [...materialesSeleccionados]
    if (field === "materialId") {
      const material = materialesDisponibles.find((m) => m.id === value)
      if (material) {
        nuevos[index] = {
          ...nuevos[index],
          materialId: value,
          nombre: material.nombre,
          costoUnitario: Number(material.costoUnitario),
          unidad: material.unidadMedida,
        }
      }
    } else {
      nuevos[index] = { ...nuevos[index], [field]: value }
    }
    setMaterialesSeleccionados(nuevos)
  }

  const eliminarMaterial = (index: number) => {
    setMaterialesSeleccionados(materialesSeleccionados.filter((_, i) => i !== index))
  }

  const agregarCostoVariable = () => {
    setCostosVariables([
      ...costosVariables,
      { conceptoId: "", concepto: "", monto: 0, descripcion: "" },
    ])
  }

  const actualizarCostoVariable = (index: number, field: string, value: any) => {
    const nuevos = [...costosVariables]
    if (field === "conceptoId") {
      const concepto = conceptosCatalogo.find((c) => c.id === value)
      if (concepto) {
        const montoSugerido =
          concepto.montoDefecto !== null && concepto.montoDefecto !== undefined
            ? Number(concepto.montoDefecto)
            : 0
        nuevos[index] = {
          ...nuevos[index],
          conceptoId: value,
          concepto: concepto.nombre,
          monto: montoSugerido,
          descripcion: concepto.descripcion ?? nuevos[index].descripcion ?? "",
        }
      } else {
        nuevos[index] = {
          ...nuevos[index],
          conceptoId: "",
          concepto: "",
        }
      }
    } else {
      nuevos[index] = { ...nuevos[index], [field]: value }
    }
    setCostosVariables(nuevos)
  }

  const eliminarCostoVariable = (index: number) => {
    setCostosVariables(costosVariables.filter((_, i) => i !== index))
  }

  const calcular = () => {
    if (materialesSeleccionados.length === 0) {
      toast.error("Agrega al menos un material")
      return
    }
    const totalCostosVariables = costosVariables.reduce(
      (sum, cv) => sum + Number(cv.monto),
      0,
    )
    const manoObraNum = parseFloat(costoManoObra) || 0
    const resultado = calcularCostosPrenda(materialesSeleccionados, manoObraNum, {
      margenPorcentaje,
    })
    resultado.costoTotalUnitario = Number(resultado.costoTotalUnitario) + totalCostosVariables
    resultado.precioVentaUnitario = resultado.costoTotalUnitario * (1 + margenPorcentaje / 100)
    resultado.precioDocena = resultado.precioVentaUnitario * 12 * 0.85
    setResultado(resultado)
    setSugerencias(sugerirPrecioCompetitivo(resultado.costoTotalUnitario))
    toast.success("Cálculo realizado", {
      description: `Precio unitario: ${formatMoneda(resultado.precioVentaUnitario)}`,
    })
  }

  const guardar = async () => {
    if (!nombre.trim()) {
      toast.error("Ingresa un nombre para la prenda")
      return
    }
    if (!resultado) {
      toast.error("Primero realiza el cálculo")
      return
    }
    setIsSaving(true)
    try {
      const response = await fetch("/api/prendas/calculadas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          prendaBaseId: prendaBaseId || null,
          clienteId: clienteId || null,
          talla: talla || null,
          costoMateriales: resultado.costoMateriales,
          costoManoObra: resultado.costoManoObra,
          costosIndirectos: resultado.costosIndirectos,
          costoTotalUnitario: resultado.costoTotalUnitario,
          precioVentaUnitario: resultado.precioVentaUnitario,
          precioVentaDocena: resultado.precioDocena,
          margenAplicadoPct: resultado.margenAplicado,
          tiempoRealMin: null,
          esReferencia: true,
          esParaInventario,
          cantidadInventario: esParaInventario ? cantidadInventario : 0,
          stockMinimo: esParaInventario ? stockMinimo : 0,
          materiales: materialesSeleccionados.map((m) => ({
            materialId: m.materialId,
            cantidadUsada: m.cantidad,
            costoUnitario: m.costoUnitario,
            costoTotal: m.cantidad * m.costoUnitario,
          })),
          costosVariables: costosVariables.filter((cv) => cv.concepto),
        }),
      })
      if (!response.ok) throw new Error("Error al guardar")
      const data = await response.json()
      if (costosVariables.length > 0 && data.id) {
        for (const cv of costosVariables.filter((c) => c.concepto)) {
          await fetch("/api/costos-variables", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prendaCalculadaId: data.id,
              concepto: cv.concepto,
              monto: cv.monto,
              descripcion: cv.descripcion,
            }),
          })
        }
      }
      toast.success("Prenda guardada", {
        description: "El cálculo se guardó en el historial",
      })
      setNombre("")
      setPrendaBaseId("")
      setClienteId("")
      setTalla("")
      setCostoManoObra("")
      setMaterialesSeleccionados([])
      setCostosVariables([])
      setResultado(null)
      setSugerencias([])
    } catch (error) {
      toast.error("Error al guardar la prenda")
    } finally {
      setIsSaving(false)
    }
  }

  const totalCostosVariables = costosVariables.reduce(
    (sum, cv) => sum + Number(cv.monto || 0),
    0,
  )

  return (
    <div className="space-y-8">
      <PageHeader
        title="Calculadora de costos"
        description="Calcula el costo y precio de venta de tus prendas"
        icon={Calculator}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Información de la prenda</CardTitle>
              <CardDescription>Datos básicos y configuración</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="nombre">Nombre de la prenda *</Label>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Blusa elegante cliente María"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="prendaBase">Plantilla base (opcional)</Label>
                  <select
                    id="prendaBase"
                    value={prendaBaseId}
                    onChange={(e) => handlePrendaBaseChange(e.target.value)}
                    className={SELECT_CLASS}
                  >
                    <option value="">Sin plantilla</option>
                    {prendasBase.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cliente">Cliente (opcional)</Label>
                  <select
                    id="cliente"
                    value={clienteId}
                    onChange={(e) => setClienteId(e.target.value)}
                    className={SELECT_CLASS}
                  >
                    <option value="">Sin cliente</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="talla">Talla</Label>
                  <Input
                    id="talla"
                    value={talla}
                    onChange={(e) => setTalla(e.target.value)}
                    placeholder="S, M, L, XL..."
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="costoManoObra" className="flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5" />
                    Mano de obra ($) — opcional
                  </Label>
                  <Input
                    id="costoManoObra"
                    type="number"
                    step="0.01"
                    min="0"
                    value={costoManoObra}
                    onChange={(e) => setCostoManoObra(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="col-span-2 space-y-1.5">
                  <Label htmlFor="margen" className="flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5" />
                    Margen de ganancia (%)
                  </Label>
                  <Input
                    id="margen"
                    type="number"
                    step="0.01"
                    value={margenPorcentaje}
                    onChange={(e) => setMargenPorcentaje(Number(e.target.value))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    id="esParaInventario"
                    checked={esParaInventario}
                    onChange={(e) => setEsParaInventario(e.target.checked)}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  <span className="cursor-pointer font-medium">Agregar al inventario</span>
                </label>

                {esParaInventario && (
                  <div className="grid grid-cols-2 gap-4 border-l-2 border-primary/30 pl-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="cantidadInventario">Cantidad inicial</Label>
                      <Input
                        id="cantidadInventario"
                        type="number"
                        min="0"
                        value={cantidadInventario}
                        onChange={(e) => setCantidadInventario(Number(e.target.value))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="stockMinimo">Stock mínimo</Label>
                      <Input
                        id="stockMinimo"
                        type="number"
                        min="0"
                        value={stockMinimo}
                        onChange={(e) => setStockMinimo(Number(e.target.value))}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  Materiales
                </CardTitle>
                <CardDescription>Agrega los materiales necesarios</CardDescription>
              </div>
              <Button onClick={agregarMaterial} size="sm" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Agregar
              </Button>
            </CardHeader>
            <CardContent>
              {materialesSeleccionados.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No hay materiales agregados
                </p>
              ) : (
                <div className="space-y-2">
                  {materialesSeleccionados.map((mat, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 rounded-md border border-border/60 bg-muted/30 p-3"
                    >
                      <div className="grid flex-1 grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            Material
                          </Label>
                          <select
                            value={mat.materialId}
                            onChange={(e) =>
                              actualizarMaterial(index, "materialId", e.target.value)
                            }
                            className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                          >
                            <option value="">Seleccionar...</option>
                            {materialesDisponibles.map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            Cantidad
                          </Label>
                          <Input
                            type="number"
                            step="0.001"
                            value={mat.cantidad}
                            onChange={(e) =>
                              actualizarMaterial(index, "cantidad", Number(e.target.value))
                            }
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            Subtotal
                          </Label>
                          <div className="flex h-9 items-center font-semibold tabular-nums">
                            {formatMoneda(mat.cantidad * mat.costoUnitario)}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mt-5 text-muted-foreground hover:text-destructive"
                        onClick={() => eliminarMaterial(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  Costos variables
                </CardTitle>
                <CardDescription>
                  Gastos específicos para esta prenda. Selecciona desde el
                  catálogo de conceptos.
                </CardDescription>
              </div>
              <Button
                onClick={agregarCostoVariable}
                size="sm"
                variant="outline"
                disabled={conceptosCatalogo.length === 0}
              >
                <Plus className="mr-2 h-4 w-4" />
                Agregar
              </Button>
            </CardHeader>
            <CardContent>
              {conceptosCatalogo.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No hay conceptos en el catálogo. Crea algunos en
                  <span className="ml-1 font-medium">
                    Configuración → Conceptos de costos variables
                  </span>
                  .
                </p>
              ) : costosVariables.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No hay costos variables agregados
                </p>
              ) : (
                <div className="space-y-2">
                  {costosVariables.map((cv, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 rounded-md border border-border/60 bg-muted/30 p-3"
                    >
                      <div className="grid flex-1 grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            Concepto
                          </Label>
                          <select
                            value={cv.conceptoId}
                            onChange={(e) =>
                              actualizarCostoVariable(index, "conceptoId", e.target.value)
                            }
                            className="flex h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
                          >
                            <option value="">Seleccionar...</option>
                            {conceptosCatalogo.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.nombre}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            Monto ($)
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={cv.monto}
                            onChange={(e) =>
                              actualizarCostoVariable(index, "monto", Number(e.target.value))
                            }
                            className="h-9"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            Descripción
                          </Label>
                          <Input
                            value={cv.descripcion || ""}
                            onChange={(e) =>
                              actualizarCostoVariable(index, "descripcion", e.target.value)
                            }
                            placeholder="Detalles..."
                            className="h-9"
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mt-5 text-muted-foreground hover:text-destructive"
                        onClick={() => eliminarCostoVariable(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex items-center justify-between rounded-md border border-primary/20 bg-primary/5 px-3 py-2">
                    <span className="text-sm font-medium">Total costos variables</span>
                    <span className="text-base font-semibold tabular-nums text-primary">
                      {formatMoneda(totalCostosVariables)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={calcular} className="flex-1" size="lg">
              <Calculator className="mr-2 h-4 w-4" />
              Calcular costos
            </Button>
            {resultado && (
              <Button onClick={guardar} variant="outline" size="lg" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                Guardar
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {resultado ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Resultado del cálculo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Materiales</span>
                      <span className="font-medium tabular-nums">
                        {formatMoneda(resultado.costoMateriales)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mano de obra</span>
                      <span className="font-medium tabular-nums">
                        {formatMoneda(resultado.costoManoObra)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Costos indirectos</span>
                      <span className="font-medium tabular-nums">
                        {formatMoneda(resultado.costosIndirectos)}
                      </span>
                    </div>
                    {totalCostosVariables > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Costos variables</span>
                        <span className="font-medium tabular-nums">
                          {formatMoneda(totalCostosVariables)}
                        </span>
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="rounded-md bg-muted/50 p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Costo total unitario
                    </p>
                    <p className="text-2xl font-semibold tabular-nums text-foreground">
                      {formatMoneda(resultado.costoTotalUnitario)}
                    </p>
                  </div>

                  <div className="rounded-md border border-success/20 bg-success/5 p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Precio de venta unitario
                    </p>
                    <p className="text-2xl font-semibold tabular-nums text-success">
                      {formatMoneda(resultado.precioVentaUnitario)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ganancia: {formatMoneda(resultado.gananciaUnitaria)} ({margenPorcentaje}%)
                    </p>
                  </div>

                  <div className="rounded-md border border-info/20 bg-info/5 p-3">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Precio por docena
                    </p>
                    <p className="text-2xl font-semibold tabular-nums text-info">
                      {formatMoneda(resultado.precioDocena)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Unitario: {formatMoneda(resultado.precioUnitarioEnDocena)} (15% desc.)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {sugerencias.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Sugerencias de precio</CardTitle>
                    <CardDescription>Diferentes márgenes de ganancia</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {sugerencias.map((sug, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded px-2 py-1.5 text-sm hover:bg-muted/60"
                        >
                          <span className="text-muted-foreground">
                            {sug.margen}% margen
                          </span>
                          <span className="font-semibold tabular-nums">
                            {formatMoneda(sug.precio)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Calculator className="mx-auto mb-3 h-10 w-10 opacity-40" />
                <p className="text-sm">Agrega materiales y presiona</p>
                <p className="font-semibold">"Calcular costos"</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
