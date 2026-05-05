import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/stat-card"
import { Users, Shirt, Package, DollarSign, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"
import { formatMoneda } from "@/lib/utils"

async function getDashboardStats() {
  const [
    totalClientes,
    totalPrendasBase,
    totalMateriales,
    materialesBajoStock,
    prendasCalculadas,
    transacciones
  ] = await Promise.all([
    prisma.cliente.count(),
    prisma.prendaBase.count({ where: { activo: true } }),
    prisma.material.count({ where: { activo: true } }),
    prisma.material.count({
      where: {
        activo: true,
        stockActual: { lte: prisma.material.fields.stockMinimo }
      }
    }),
    prisma.prendaCalculada.findMany({
      take: 5,
      orderBy: { fechaCalculo: 'desc' },
      include: {
        cliente: true,
        prendaBase: true
      }
    }),
    prisma.transaccion.findMany({
      take: 10,
      orderBy: { fecha: 'desc' }
    })
  ])

  const ingresosMes = transacciones
    .filter((t) => t.tipo === 'INGRESO')
    .reduce((sum, t) => sum + Number(t.monto), 0)

  const egresosMes = transacciones
    .filter((t) => t.tipo.startsWith('EGRESO'))
    .reduce((sum, t) => sum + Number(t.monto), 0)

  return {
    totalClientes,
    totalPrendasBase,
    totalMateriales,
    materialesBajoStock,
    prendasCalculadas,
    ingresosMes,
    egresosMes,
    balanceMes: ingresosMes - egresosMes
  }
}

export default async function DashboardPage() {
  const session = await auth()
  const stats = await getDashboardStats()
  const balancePositivo = stats.balanceMes >= 0

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Hola, ${session?.user?.nombre?.split(" ")[0] ?? ""}`}
        description="Resumen general de tu negocio de diseño de moda"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Clientes"
          value={stats.totalClientes}
          hint="Registrados en total"
          icon={Users}
          tone="primary"
        />
        <StatCard
          label="Prendas base"
          value={stats.totalPrendasBase}
          hint="Plantillas activas"
          icon={Shirt}
          tone="info"
        />
        <StatCard
          label="Materiales"
          value={stats.totalMateriales}
          hint={
            stats.materialesBajoStock > 0 ? (
              <span className="text-destructive">
                {stats.materialesBajoStock} bajo stock
              </span>
            ) : (
              "Stock en orden"
            )
          }
          icon={Package}
          tone={stats.materialesBajoStock > 0 ? "warning" : "success"}
        />
        <StatCard
          label="Balance del mes"
          value={
            <span className={balancePositivo ? "text-success" : "text-destructive"}>
              {formatMoneda(stats.balanceMes)}
            </span>
          }
          hint="Ingresos − egresos"
          icon={DollarSign}
          tone={balancePositivo ? "success" : "danger"}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Cálculos recientes</CardTitle>
            <CardDescription>Últimas 5 prendas calculadas</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.prendasCalculadas.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Aún no has calculado prendas
              </p>
            ) : (
              <div className="divide-y divide-border/60">
                {stats.prendasCalculadas.map((prenda) => (
                  <div
                    key={prenda.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">
                        {prenda.nombre}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {prenda.cliente?.nombre || "Sin cliente"} ·{" "}
                        {prenda.prendaBase?.nombre || "Personalizada"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold tabular-nums text-foreground">
                        {formatMoneda(Number(prenda.precioVentaUnitario))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(prenda.fechaCalculo).toLocaleDateString("es-MX")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Resumen financiero</CardTitle>
            <CardDescription>Movimientos del mes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="text-sm text-muted-foreground">Ingresos</span>
              </div>
              <span className="text-sm font-semibold tabular-nums text-success">
                {formatMoneda(stats.ingresosMes)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-destructive" />
                <span className="text-sm text-muted-foreground">Egresos</span>
              </div>
              <span className="text-sm font-semibold tabular-nums text-destructive">
                {formatMoneda(stats.egresosMes)}
              </span>
            </div>
            <div className="border-t border-border/60 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Balance</span>
                <span
                  className={`text-base font-semibold tabular-nums ${
                    balancePositivo ? "text-success" : "text-destructive"
                  }`}
                >
                  {formatMoneda(stats.balanceMes)}
                </span>
              </div>
            </div>

            {stats.materialesBajoStock > 0 && (
              <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 p-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning-foreground" />
                <div className="text-xs">
                  <p className="font-medium text-warning-foreground">
                    Inventario bajo
                  </p>
                  <p className="mt-0.5 text-muted-foreground">
                    {stats.materialesBajoStock} material
                    {stats.materialesBajoStock > 1 ? "es" : ""} requiere
                    {stats.materialesBajoStock > 1 ? "n" : ""} reposición
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
