"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2, X } from "lucide-react"
import * as XLSX from 'xlsx'

interface PrendaImport {
  nombre: string
  talla?: string
  cantidad: number
  precioVenta: number
  costo?: number
  stockMinimo?: number
  notas?: string
  error?: string
}

interface ImportarExcelProps {
  onSuccess: () => void
}

export function ImportarExcel({ onSuccess }: ImportarExcelProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [prendas, setPrendas] = useState<PrendaImport[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const descargarPlantilla = () => {
    const plantilla = [
      {
        "Nombre": "Blusa Roja M",
        "Talla": "M",
        "Cantidad": 10,
        "Precio Venta": 45.00,
        "Costo": 25.00,
        "Stock Mínimo": 3,
        "Notas": "Color rojo intenso"
      },
      {
        "Nombre": "Vestido Azul L",
        "Talla": "L",
        "Cantidad": 5,
        "Precio Venta": 80.00,
        "Costo": 50.00,
        "Stock Mínimo": 2,
        "Notas": "Tela importada"
      }
    ]

    const ws = XLSX.utils.json_to_sheet(plantilla)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Inventario")
    
    // Ajustar ancho de columnas
    ws['!cols'] = [
      { wch: 25 }, // Nombre
      { wch: 10 }, // Talla
      { wch: 10 }, // Cantidad
      { wch: 15 }, // Precio Venta
      { wch: 12 }, // Costo
      { wch: 15 }, // Stock Mínimo
      { wch: 30 }, // Notas
    ]

    XLSX.writeFile(wb, "plantilla_inventario.xlsx")
    toast.success("Plantilla descargada", {
      description: "Revisa tu carpeta de descargas"
    })
  }

  const validarPrenda = (prenda: any, index: number): PrendaImport => {
    const errors: string[] = []

    if (!prenda["Nombre"] || prenda["Nombre"].trim() === "") {
      errors.push("Nombre requerido")
    }

    if (!prenda["Cantidad"] || prenda["Cantidad"] <= 0) {
      errors.push("Cantidad inválida")
    }

    if (!prenda["Precio Venta"] || prenda["Precio Venta"] <= 0) {
      errors.push("Precio de venta inválido")
    }

    return {
      nombre: prenda["Nombre"] || `Prenda ${index + 1}`,
      talla: prenda["Talla"] || undefined,
      cantidad: parseInt(prenda["Cantidad"]) || 0,
      precioVenta: parseFloat(prenda["Precio Venta"]) || 0,
      costo: prenda["Costo"] ? parseFloat(prenda["Costo"]) : undefined,
      stockMinimo: prenda["Stock Mínimo"] ? parseInt(prenda["Stock Mínimo"]) : 0,
      notas: prenda["Notas"] || undefined,
      error: errors.length > 0 ? errors.join(", ") : undefined
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(worksheet)

        if (json.length === 0) {
          toast.error("El archivo está vacío")
          return
        }

        const prendasValidadas = json.map((row, index) => validarPrenda(row, index))
        setPrendas(prendasValidadas)
        setIsDialogOpen(true)

        toast.success(`${prendasValidadas.length} prendas cargadas`, {
          description: "Revisa los datos antes de importar"
        })
      } catch (error) {
        toast.error("Error al leer el archivo", {
          description: "Asegúrate de usar la plantilla correcta"
        })
      }
    }

    reader.readAsArrayBuffer(file)
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const importarPrendas = async () => {
    const prendasValidas = prendas.filter(p => !p.error)
    
    if (prendasValidas.length === 0) {
      toast.error("No hay prendas válidas para importar")
      return
    }

    setIsImporting(true)
    let exitosas = 0
    let fallidas = 0

    try {
      for (const prenda of prendasValidas) {
        try {
          const costoTotal = prenda.costo || (prenda.precioVenta * 0.6)
          const margen = ((prenda.precioVenta - costoTotal) / costoTotal) * 100

          const response = await fetch("/api/prendas/calculadas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nombre: prenda.nombre,
              talla: prenda.talla || null,
              costoMateriales: 0,
              costoManoObra: 0,
              costosIndirectos: 0,
              costoTotalUnitario: costoTotal,
              precioVentaUnitario: prenda.precioVenta,
              precioVentaDocena: prenda.precioVenta * 12 * 0.85,
              margenAplicadoPct: margen,
              tiempoRealMin: null,
              notasTecnicas: prenda.notas || null,
              esReferencia: false,
              esParaInventario: true,
              cantidadInventario: prenda.cantidad,
              stockMinimo: prenda.stockMinimo || 0,
              materiales: [],
            }),
          })

          if (response.ok) {
            exitosas++
          } else {
            fallidas++
          }
        } catch (error) {
          fallidas++
        }
      }

      toast.success(`Importación completada`, {
        description: `${exitosas} exitosas, ${fallidas} fallidas`
      })

      setIsDialogOpen(false)
      setPrendas([])
      onSuccess()
    } catch (error) {
      toast.error("Error durante la importación")
    } finally {
      setIsImporting(false)
    }
  }

  const prendasValidas = prendas.filter(p => !p.error).length
  const prendasInvalidas = prendas.filter(p => p.error).length

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" onClick={descargarPlantilla}>
          <Download className="mr-2 h-4 w-4" />
          Descargar Plantilla
        </Button>
        <Button onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          Importar Excel
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Vista Previa de Importación
            </DialogTitle>
            <DialogDescription>
              Revisa los datos antes de importar al inventario
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Badge variant="default" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {prendasValidas} Válidas
              </Badge>
              {prendasInvalidas > 0 && (
                <Badge variant="destructive" className="gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {prendasInvalidas} Con Errores
                </Badge>
              )}
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {prendas.map((prenda, index) => (
                <Card key={index} className={prenda.error ? "border-destructive" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium">{prenda.nombre}</p>
                          {prenda.talla && (
                            <p className="text-muted-foreground">Talla: {prenda.talla}</p>
                          )}
                        </div>
                        <div>
                          <p className="text-muted-foreground">Cantidad</p>
                          <p className="font-semibold">{prenda.cantidad}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Precio Venta</p>
                          <p className="font-semibold">${prenda.precioVenta.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Costo</p>
                          <p className="font-semibold">
                            {prenda.costo ? `$${prenda.costo.toFixed(2)}` : "Auto"}
                          </p>
                        </div>
                      </div>
                      {prenda.error ? (
                        <Badge variant="destructive" className="gap-1">
                          <X className="h-3 w-3" />
                          {prenda.error}
                        </Badge>
                      ) : (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          OK
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={importarPrendas} 
                disabled={isImporting || prendasValidas === 0}
              >
                {isImporting ? "Importando..." : `Importar ${prendasValidas} Prendas`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
