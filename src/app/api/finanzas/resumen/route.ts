import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const mes = searchParams.get("mes")
    const año = searchParams.get("año")

    const now = new Date()
    const mesActual = mes ? parseInt(mes) : now.getMonth() + 1
    const añoActual = año ? parseInt(año) : now.getFullYear()

    const startDate = new Date(añoActual, mesActual - 1, 1)
    const endDate = new Date(añoActual, mesActual, 0, 23, 59, 59)

    const transacciones = await prisma.transaccion.findMany({
      where: {
        fecha: {
          gte: startDate,
          lte: endDate,
        }
      }
    })

    const ingresos = transacciones
      .filter(t => t.tipo === "INGRESO")
      .reduce((sum, t) => sum + Number(t.monto), 0)

    const egresos = transacciones
      .filter(t => t.tipo.startsWith("EGRESO"))
      .reduce((sum, t) => sum + Number(t.monto), 0)

    const balance = ingresos - egresos

    const porCategoria = transacciones.reduce((acc: any, t) => {
      const cat = t.categoria || "Sin categoría"
      if (!acc[cat]) {
        acc[cat] = { ingresos: 0, egresos: 0 }
      }
      if (t.tipo === "INGRESO") {
        acc[cat].ingresos += Number(t.monto)
      } else {
        acc[cat].egresos += Number(t.monto)
      }
      return acc
    }, {})

    return NextResponse.json({
      ingresos,
      egresos,
      balance,
      totalTransacciones: transacciones.length,
      porCategoria,
      mes: mesActual,
      año: añoActual,
    })
  } catch (error) {
    console.error("Error al obtener resumen:", error)
    return NextResponse.json(
      { error: "Error al obtener resumen" },
      { status: 500 }
    )
  }
}
