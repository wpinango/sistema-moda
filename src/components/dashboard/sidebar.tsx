"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Users,
  Shirt,
  Package,
  Calculator,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
  Scissors,
  LogOut,
  Warehouse,
  History,
} from "lucide-react"
import { signOut } from "next-auth/react"

type Route = {
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}

type RouteGroup = {
  label: string
  routes: Route[]
}

const routeGroups: RouteGroup[] = [
  {
    label: "General",
    routes: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { label: "Clientes", icon: Users, href: "/dashboard/clientes" },
    ],
  },
  {
    label: "Producción",
    routes: [
      { label: "Prendas Base", icon: Shirt, href: "/dashboard/prendas/base" },
      { label: "Calculadora", icon: Calculator, href: "/dashboard/prendas/calculadora" },
      { label: "Historial", icon: History, href: "/dashboard/prendas/calculadas" },
    ],
  },
  {
    label: "Stock",
    routes: [
      { label: "Inventario", icon: Warehouse, href: "/dashboard/inventario" },
      { label: "Materiales", icon: Package, href: "/dashboard/materiales" },
    ],
  },
  {
    label: "Negocio",
    routes: [
      { label: "Cotizaciones", icon: FileText, href: "/dashboard/cotizaciones" },
      { label: "Finanzas", icon: DollarSign, href: "/dashboard/finanzas" },
      { label: "Reportes", icon: BarChart3, href: "/dashboard/reportes" },
    ],
  },
  {
    label: "Sistema",
    routes: [
      { label: "Configuración", icon: Settings, href: "/dashboard/configuracion" },
    ],
  },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href)

  return (
    <div className="flex h-full flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="px-5 py-5">
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
          onClick={onNavigate}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Scissors className="h-4 w-4" />
          </div>
          <div className="leading-tight">
            <h2 className="text-sm font-semibold tracking-tight text-foreground">
              Sistema Moda
            </h2>
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              Gestión de Diseño
            </p>
          </div>
        </Link>
      </div>

      <ScrollArea className="min-h-0 flex-1 px-3">
        <nav className="space-y-6 pb-4">
          {routeGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                {group.label}
              </p>
              {group.routes.map((route) => {
                const active = isActive(route.href)
                return (
                  <Button
                    key={route.href}
                    variant="ghost"
                    asChild
                    className={cn(
                      "h-9 w-full justify-start gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-accent text-foreground"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-foreground",
                    )}
                  >
                    <Link href={route.href} onClick={onNavigate}>
                      <route.icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                      <span>{route.label}</span>
                      {active && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </Link>
                  </Button>
                )
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          className="h-9 w-full justify-start gap-3 rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  )
}
