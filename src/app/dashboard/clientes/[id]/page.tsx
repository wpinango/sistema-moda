"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatMoneda, formatearFecha } from "@/lib/utils"
import { ArrowLeft, Mail, Phone, MapPin, Ruler } from "lucide-react"
import { toast } from "sonner"

export default function ClienteDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [cliente, setCliente] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCliente = async () => {
      try {
        const response = await fetch(`/api/clientes/${params.id}`)
        if (!response.ok) throw new Error("Error al cargar cliente")
        const data = await response.json()
        setCliente(data)
      } catch (error) {
        toast.error("Error al cargar cliente")
        router.push("/dashboard/clientes")
      } finally {
        setIsLoading(false)
      }
    }
    if (params.id) fetchCliente()
  }, [params.id, router])

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    )
  }
  if (!cliente) return null

  const ultimaMedida = cliente.medidas?.[0]

  const renderMedida = (label: string, value: any, fullWidth = false) =>
    value ? (
      <div className={fullWidth ? "col-span-2" : ""}>
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="text-xl font-semibold tabular-nums">
          {Number(value)}
          <span className="ml-1 text-sm font-normal text-muted-foreground">cm</span>
        </p>
      </div>
    ) : null

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3 border-b border-border/60 pb-6">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
            {cliente.nombre}
          </h1>
          <p className="text-sm text-muted-foreground">Información del cliente</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Datos de contacto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cliente.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Email
                  </p>
                  <p className="text-sm">{cliente.email}</p>
                </div>
              </div>
            )}
            {cliente.telefono && (
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Teléfono
                  </p>
                  <p className="text-sm">{cliente.telefono}</p>
                </div>
              </div>
            )}
            {cliente.direccion && (
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Dirección
                  </p>
                  <p className="text-sm">{cliente.direccion}</p>
                </div>
              </div>
            )}
            {cliente.notas && (
              <>
                <Separator />
                <div>
                  <p className="mb-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                    Notas
                  </p>
                  <p className="text-sm text-foreground">{cliente.notas}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              Medidas corporales
            </CardTitle>
            {ultimaMedida && (
              <CardDescription>
                Última actualización: {formatearFecha(ultimaMedida.fechaToma)}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {ultimaMedida ? (
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {renderMedida("Busto", ultimaMedida.busto)}
                {renderMedida("Cintura", ultimaMedida.cintura)}
                {renderMedida("Cadera", ultimaMedida.cadera)}
                {renderMedida("Largo manga", ultimaMedida.largoManga)}
                {renderMedida("Largo total", ultimaMedida.largoTotal, true)}
                {ultimaMedida.notas && (
                  <div className="col-span-2 border-t border-border/60 pt-3">
                    <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                      Notas
                    </p>
                    <p className="text-sm text-foreground">{ultimaMedida.notas}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No hay medidas registradas
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {cliente.prendas && cliente.prendas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Prendas calculadas</CardTitle>
            <CardDescription>
              Últimas 5 prendas calculadas para este cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/60">
              {cliente.prendas.map((prenda: any) => (
                <div
                  key={prenda.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">{prenda.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatearFecha(prenda.fechaCalculo)}
                      {prenda.talla && ` · Talla ${prenda.talla}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold tabular-nums">
                      {formatMoneda(Number(prenda.precioVentaUnitario))}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      Unitario
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {cliente.cotizaciones && cliente.cotizaciones.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cotizaciones</CardTitle>
            <CardDescription>
              Últimas 5 cotizaciones para este cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/60">
              {cliente.cotizaciones.map((cotizacion: any) => (
                <div
                  key={cotizacion.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">{cotizacion.numero}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatearFecha(cotizacion.createdAt)}
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    <Badge
                      variant={
                        cotizacion.estado === "CANCELADO"
                          ? "destructive"
                          : cotizacion.estado === "COTIZADO"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {cotizacion.estado}
                    </Badge>
                    <p className="text-sm font-semibold tabular-nums">
                      {formatMoneda(Number(cotizacion.total))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
