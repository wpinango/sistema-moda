import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const costos = await prisma.costoFijo.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(costos)
  } catch (error) {
    console.error("Error al obtener costos fijos:", error)
    return NextResponse.json(
      { error: "Error al obtener costos fijos" },
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
    const { nombre, monto, periodicidad, descripcion } = body

    const costo = await prisma.costoFijo.create({
      data: {
        nombre,
        monto: parseFloat(monto),
        periodicidad: periodicidad || "MENSUAL",
        descripcion,
      },
    })

    return NextResponse.json(costo, { status: 201 })
  } catch (error) {
    console.error("Error al crear costo fijo:", error)
    return NextResponse.json(
      { error: "Error al crear costo fijo" },
      { status: 500 }
    )
  }
}
