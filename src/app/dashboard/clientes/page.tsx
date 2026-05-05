"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { EmptyState } from "@/components/ui/empty-state"
import { ClienteForm } from "@/components/forms/cliente-form"
import { Plus, Pencil, Eye, Users, Mail, Phone, Trash2, Ruler, ShoppingBag } from "lucide-react"
import { toast } from "sonner"

export default function ClientesPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<any>(null)

  const fetchClientes = async () => {
    try {
      const response = await fetch("/api/clientes")
      if (!response.ok) throw new Error("Error al cargar clientes")
      const data = await response.json()
      setClientes(data)
    } catch (error) {
      toast.error("Error al cargar clientes")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchClientes()
  }, [])

  const handleEdit = (cliente: any) => {
    setSelectedCliente(cliente)
    setIsDialogOpen(true)
  }

  const handleNew = () => {
    setSelectedCliente(null)
    setIsDialogOpen(true)
  }

  const handleSuccess = () => {
    setIsDialogOpen(false)
    setSelectedCliente(null)
    fetchClientes()
  }

  const handleView = (id: string) => {
    router.push(`/dashboard/clientes/${id}`)
  }

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar al cliente "${nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      return
    }

    try {
      const response = await fetch(`/api/clientes/${id}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Error al eliminar")

      toast.success("Cliente eliminado", {
        description: `${nombre} ha sido eliminado correctamente`,
      })
      fetchClientes()
    } catch (error) {
      toast.error("Error al eliminar cliente")
    }
  }

  const conMedidas = clientes.filter((c) => c.medidas && c.medidas.length > 0).length
  const conPrendas = clientes.filter((c) => c._count && c._count.prendas > 0).length

  return (
    <div className="space-y-8">
      <PageHeader
        title="Clientes"
        description="Gestiona tu cartera de clientes"
        icon={Users}
        actions={
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo cliente
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total clientes"
          value={clientes.length}
          hint="Registrados"
          icon={Users}
          tone="primary"
        />
        <StatCard
          label="Con medidas"
          value={conMedidas}
          hint="Tienen medidas registradas"
          icon={Ruler}
          tone="info"
        />
        <StatCard
          label="Con prendas"
          value={conPrendas}
          hint="Tienen prendas calculadas"
          icon={ShoppingBag}
          tone="success"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de clientes</CardTitle>
          <CardDescription>
            {clientes.length} cliente{clientes.length !== 1 ? "s" : ""} registrado
            {clientes.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Cargando clientes...
            </p>
          ) : clientes.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No hay clientes"
              description="Comienza agregando tu primer cliente para gestionar su información"
              action={
                <Button onClick={handleNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar cliente
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {clientes.map((cliente) => (
                <Card key={cliente.id} className="transition-shadow hover:shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{cliente.nombre}</CardTitle>
                    {(cliente.email || cliente.telefono) && (
                      <CardDescription className="space-y-1 pt-1">
                        {cliente.email && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{cliente.email}</span>
                          </div>
                        )}
                        {cliente.telefono && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <Phone className="h-3 w-3" />
                            {cliente.telefono}
                          </div>
                        )}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {cliente.medidas && cliente.medidas.length > 0 && (
                        <Badge variant="secondary">Con medidas</Badge>
                      )}
                      {cliente._count?.prendas > 0 && (
                        <Badge variant="outline">
                          {cliente._count.prendas} prenda{cliente._count.prendas !== 1 ? "s" : ""}
                        </Badge>
                      )}
                      {cliente._count?.cotizaciones > 0 && (
                        <Badge variant="outline">
                          {cliente._count.cotizaciones} cotización
                          {cliente._count.cotizaciones !== 1 ? "es" : ""}
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleView(cliente.id)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(cliente)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(cliente.id, cliente.nombre)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCliente ? "Editar cliente" : "Nuevo cliente"}
            </DialogTitle>
          </DialogHeader>
          <ClienteForm
            cliente={selectedCliente}
            onSuccess={handleSuccess}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
