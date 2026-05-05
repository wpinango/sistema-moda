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
    const activo = searchParams.get("activo")

    const materiales = await prisma.material.findMany({
      where: activo !== null ? { activo: activo === "true" } : {},
      orderBy: { nombre: "asc" },
    })

    return NextResponse.json(materiales)
  } catch (error) {
    console.error("Error al obtener materiales:", error)
    return NextResponse.json(
      { error: "Error al obtener materiales" },
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
    const {
      nombre,
      tipo,
      unidadMedida,
      color,
      stockActual,
      stockMinimo,
      costoUnitario,
      proveedor,
      notas,
    } = body

    const material = await prisma.material.create({
      data: {
        nombre,
        tipo,
        unidadMedida,
        color,
        stockActual: parseFloat(stockActual || 0),
        stockMinimo: parseFloat(stockMinimo || 0),
        costoUnitario: parseFloat(costoUnitario || 0),
        proveedor,
        notas,
      },
    })

    return NextResponse.json(material, { status: 201 })
  } catch (error) {
    console.error("Error al crear material:", error)
    return NextResponse.json(
      { error: "Error al crear material" },
      { status: 500 }
    )
  }
}
