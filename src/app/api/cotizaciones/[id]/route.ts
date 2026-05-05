import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id: params.id },
      include: {
        cliente: true,
        prendaCalculada: {
          include: {
            materiales: {
              include: {
                material: true
              }
            }
          }
        },
      }
    })

    if (!cotizacion) {
      return NextResponse.json(
        { error: "Cotización no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(cotizacion)
  } catch (error) {
    console.error("Error al obtener cotización:", error)
    return NextResponse.json(
      { error: "Error al obtener cotización" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { estado, fechaEntrega, subtotal, descuento, total, notas } = body

    const cotizacion = await prisma.cotizacion.update({
      where: { id: params.id },
      data: {
        ...(estado && { estado }),
        ...(fechaEntrega !== undefined && { 
          fechaEntrega: fechaEntrega ? new Date(fechaEntrega) : null 
        }),
        ...(subtotal !== undefined && { subtotal: parseFloat(subtotal) }),
        ...(descuento !== undefined && { descuento: parseFloat(descuento) }),
        ...(total !== undefined && { total: parseFloat(total) }),
        ...(notas !== undefined && { notas }),
      },
      include: {
        cliente: true,
        prendaCalculada: true,
      }
    })

    return NextResponse.json(cotizacion)
  } catch (error) {
    console.error("Error al actualizar cotización:", error)
    return NextResponse.json(
      { error: "Error al actualizar cotización" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await prisma.cotizacion.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Cotización eliminada" })
  } catch (error) {
    console.error("Error al eliminar cotización:", error)
    return NextResponse.json(
      { error: "Error al eliminar cotización" },
      { status: 500 }
    )
  }
}
