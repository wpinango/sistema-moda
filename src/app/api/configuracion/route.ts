import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const configuraciones = await prisma.configuracion.findMany()
    return NextResponse.json(configuraciones)
  } catch (error) {
    console.error("Error al obtener configuración:", error)
    return NextResponse.json(
      { error: "Error al obtener configuración" },
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
    const { configuraciones } = body

    // Actualizar o crear cada configuración
    for (const config of configuraciones) {
      await prisma.configuracion.upsert({
        where: { clave: config.clave },
        update: { valor: config.valor },
        create: {
          clave: config.clave,
          valor: config.valor,
        },
      })
    }

    const updated = await prisma.configuracion.findMany()
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error al guardar configuración:", error)
    return NextResponse.json(
      { error: "Error al guardar configuración" },
      { status: 500 }
    )
  }
}
