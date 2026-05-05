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
    const cliente = await prisma.cliente.findUnique({
      where: { id },
      include: {
        medidas: {
          orderBy: { fechaToma: 'desc' }
        },
        prendas: {
          orderBy: { fechaCalculo: 'desc' },
          take: 5
        },
        cotizaciones: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente no encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(cliente)
  } catch (error) {
    console.error("Error al obtener cliente:", error)
    return NextResponse.json(
      { error: "Error al obtener cliente" },
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
    const { nombre, email, telefono, direccion, notas, medidas } = body

    // Actualizar cliente
    const cliente = await prisma.cliente.update({
      where: { id },
      data: {
        nombre,
        email: email || null,
        telefono: telefono || null,
        direccion: direccion || null,
        notas: notas || null,
      },
    })

    // Si hay medidas, verificar si tienen valores y crearlas
    if (medidas) {
      const tieneMedidas = 
        medidas.busto || 
        medidas.cintura || 
        medidas.cadera || 
        medidas.largoManga || 
        medidas.largoTotal

      if (tieneMedidas) {
        try {
          await prisma.medida.create({
            data: {
              clienteId: id,
              busto: medidas.busto ? parseFloat(medidas.busto) : null,
              cintura: medidas.cintura ? parseFloat(medidas.cintura) : null,
              cadera: medidas.cadera ? parseFloat(medidas.cadera) : null,
              largoManga: medidas.largoManga ? parseFloat(medidas.largoManga) : null,
              largoTotal: medidas.largoTotal ? parseFloat(medidas.largoTotal) : null,
              notas: medidas.notas || null,
            }
          })
        } catch (medidaError) {
          console.error("Error al crear medidas (continuando):", medidaError)
          // Continuar aunque falle la creación de medidas
        }
      }
    }

    // Obtener cliente actualizado con medidas
    const clienteActualizado = await prisma.cliente.findUnique({
      where: { id },
      include: {
        medidas: {
          orderBy: { fechaToma: 'desc' },
          take: 1
        }
      }
    })

    return NextResponse.json(clienteActualizado)
  } catch (error) {
    console.error("Error al actualizar cliente:", error)
    return NextResponse.json(
      { error: "Error al actualizar cliente", details: error instanceof Error ? error.message : String(error) },
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
    await prisma.cliente.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Cliente eliminado" })
  } catch (error) {
    console.error("Error al eliminar cliente:", error)
    return NextResponse.json(
      { error: "Error al eliminar cliente" },
      { status: 500 }
    )
  }
}
