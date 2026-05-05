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
    const tipo = searchParams.get("tipo")
    const mes = searchParams.get("mes")
    const año = searchParams.get("año")

    let whereClause: any = {}

    if (tipo) {
      whereClause.tipo = tipo
    }

    if (mes && año) {
      const startDate = new Date(parseInt(año), parseInt(mes) - 1, 1)
      const endDate = new Date(parseInt(año), parseInt(mes), 0, 23, 59, 59)
      whereClause.fecha = {
        gte: startDate,
        lte: endDate,
      }
    }

    const transacciones = await prisma.transaccion.findMany({
      where: whereClause,
      orderBy: { fecha: "desc" },
    })

    return NextResponse.json(transacciones)
  } catch (error) {
    console.error("Error al obtener transacciones:", error)
    return NextResponse.json(
      { error: "Error al obtener transacciones" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { tipo, concepto, monto, fecha, categoria, referencia, notas } = body

    const transaccion = await prisma.transaccion.create({
      data: {
        tipo,
        concepto,
        monto: parseFloat(monto),
        fecha: fecha ? new Date(fecha) : new Date(),
        categoria,
        referencia,
        notas,
      },
    })

    return NextResponse.json(transaccion, { status: 201 })
  } catch (error) {
    console.error("Error al crear transacción:", error)
    return NextResponse.json(
      { error: "Error al crear transacción" },
      { status: 500 }
    )
  }
}
