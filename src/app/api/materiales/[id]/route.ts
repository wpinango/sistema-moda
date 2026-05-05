import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const material = await prisma.material.findUnique({
      where: { id },
    })

    if (!material) {
      return NextResponse.json(
        { error: "Material no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(material)
  } catch (error) {
    console.error("Error al obtener material:", error)
    return NextResponse.json(
      { error: "Error al obtener material" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
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
      activo,
    } = body

    const material = await prisma.material.update({
      where: { id },
      data: {
        nombre,
        tipo,
        unidadMedida,
        color,
        stockActual: stockActual !== undefined ? parseFloat(stockActual) : undefined,
        stockMinimo: stockMinimo !== undefined ? parseFloat(stockMinimo) : undefined,
        costoUnitario: costoUnitario !== undefined ? parseFloat(costoUnitario) : undefined,
        proveedor,
        notas,
        activo,
      },
    })

    return NextResponse.json(material)
  } catch (error) {
    console.error("Error al actualizar material:", error)
    return NextResponse.json(
      { error: "Error al actualizar material" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    await prisma.material.update({
      where: { id },
      data: { activo: false },
    })

    return NextResponse.json({ message: "Material desactivado" })
  } catch (error) {
    console.error("Error al desactivar material:", error)
    return NextResponse.json(
      { error: "Error al desactivar material" },
      { status: 500 }
    )
  }
}
