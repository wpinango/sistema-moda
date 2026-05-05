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
    const prenda = await prisma.prendaCalculada.findUnique({
      where: { id },
      include: {
        prendaBase: true,
        cliente: true,
        materiales: {
          include: {
            material: true
          }
        }
      }
    })

    if (!prenda) {
      return NextResponse.json(
        { error: "Prenda calculada no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(prenda)
  } catch (error) {
    console.error("Error al obtener prenda calculada:", error)
    return NextResponse.json(
      { error: "Error al obtener prenda calculada" },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
    const { cantidadInventario, cantidadVendida, stockMinimo } = body

    const prenda = await prisma.prendaCalculada.update({
      where: { id },
      data: {
        ...(cantidadInventario !== undefined && { cantidadInventario }),
        ...(cantidadVendida !== undefined && { cantidadVendida }),
        ...(stockMinimo !== undefined && { stockMinimo }),
      },
    })

    return NextResponse.json(prenda)
  } catch (error) {
    console.error("Error al actualizar prenda:", error)
    return NextResponse.json(
      { error: "Error al actualizar prenda" },
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
    await prisma.prendaCalculada.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Prenda calculada eliminada" })
  } catch (error) {
    console.error("Error al eliminar prenda calculada:", error)
    return NextResponse.json(
      { error: "Error al eliminar prenda calculada" },
      { status: 500 }
    )
  }
}
