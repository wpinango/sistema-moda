import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { generarNumeroCotizacion } from "@/lib/utils"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clienteId = searchParams.get("clienteId")
    const estado = searchParams.get("estado")

    const cotizaciones = await prisma.cotizacion.findMany({
      where: {
        ...(clienteId && { clienteId }),
        ...(estado && { estado }),
      },
      include: {
        cliente: true,
        prendaCalculada: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(cotizaciones)
  } catch (error) {
    console.error("Error al obtener cotizaciones:", error)
    return NextResponse.json(
      { error: "Error al obtener cotizaciones" },
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
      clienteId,
      prendaCalculadaId,
      fechaEntrega,
      subtotal,
      descuento,
      total,
      notas,
    } = body

    const numero = generarNumeroCotizacion()

    const cotizacion = await prisma.cotizacion.create({
      data: {
        numero,
        clienteId,
        prendaCalculadaId: prendaCalculadaId || null,
        fechaEntrega: fechaEntrega ? new Date(fechaEntrega) : null,
        subtotal: parseFloat(subtotal),
        descuento: descuento ? parseFloat(descuento) : 0,
        total: parseFloat(total),
        notas,
        estado: "COTIZADO",
      },
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

    return NextResponse.json(cotizacion, { status: 201 })
  } catch (error) {
    console.error("Error al crear cotización:", error)
    return NextResponse.json(
      { error: "Error al crear cotización" },
      { status: 500 }
    )
  }
}
