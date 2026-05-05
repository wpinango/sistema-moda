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
    const prenda = await prisma.prendaBase.findUnique({
      where: { id },
      include: {
        materiales: {
          include: {
            material: true
          }
        },
        calculadas: {
          orderBy: { fechaCalculo: 'desc' },
          take: 5,
          include: {
            cliente: true
          }
        }
      }
    })

    if (!prenda) {
      return NextResponse.json(
        { error: "Prenda base no encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(prenda)
  } catch (error) {
    console.error("Error al obtener prenda base:", error)
    return NextResponse.json(
      { error: "Error al obtener prenda base" },
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
      categoria,
      complejidad,
      tiempoEstimadoMin,
      margenSugeridoPct,
      descripcion,
      instrucciones,
      activo,
      materiales,
    } = body

    // Eliminar materiales existentes
    await prisma.prendaBaseMaterial.deleteMany({
      where: { prendaBaseId: id }
    })

    // Actualizar prenda con nuevos materiales
    const prenda = await prisma.prendaBase.update({
      where: { id },
      data: {
        nombre,
        categoria,
        complejidad,
        tiempoEstimadoMin: tiempoEstimadoMin ? parseInt(tiempoEstimadoMin) : undefined,
        margenSugeridoPct: margenSugeridoPct ? parseFloat(margenSugeridoPct) : undefined,
        descripcion,
        instrucciones,
        activo,
        materiales: {
          create: materiales?.map((m: any) => ({
            materialId: m.materialId,
            cantidad: parseFloat(m.cantidad),
            esObligatorio: m.esObligatorio ?? true,
            notas: m.notas,
          })) || []
        }
      },
      include: {
        materiales: {
          include: {
            material: true
          }
        }
      }
    })

    return NextResponse.json(prenda)
  } catch (error) {
    console.error("Error al actualizar prenda base:", error)
    return NextResponse.json(
      { error: "Error al actualizar prenda base" },
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
    await prisma.prendaBase.update({
      where: { id },
      data: { activo: false },
    })

    return NextResponse.json({ message: "Prenda base desactivada" })
  } catch (error) {
    console.error("Error al desactivar prenda base:", error)
    return NextResponse.json(
      { error: "Error al desactivar prenda base" },
      { status: 500 }
    )
  }
}
