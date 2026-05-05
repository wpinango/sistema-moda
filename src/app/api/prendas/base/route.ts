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

    const prendas = await prisma.prendaBase.findMany({
      where: activo !== null ? { activo: activo === "true" } : {},
      include: {
        materiales: {
          include: {
            material: true
          }
        },
        _count: {
          select: { calculadas: true }
        }
      },
      orderBy: { nombre: "asc" },
    })

    return NextResponse.json(prendas)
  } catch (error) {
    console.error("Error al obtener prendas base:", error)
    return NextResponse.json(
      { error: "Error al obtener prendas base" },
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
      categoria,
      complejidad,
      tiempoEstimadoMin,
      margenSugeridoPct,
      descripcion,
      instrucciones,
      materiales,
    } = body

    const prenda = await prisma.prendaBase.create({
      data: {
        nombre,
        categoria,
        complejidad,
        tiempoEstimadoMin: parseInt(tiempoEstimadoMin),
        margenSugeridoPct: parseFloat(margenSugeridoPct),
        descripcion,
        instrucciones,
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

    return NextResponse.json(prenda, { status: 201 })
  } catch (error) {
    console.error("Error al crear prenda base:", error)
    return NextResponse.json(
      { error: "Error al crear prenda base" },
      { status: 500 }
    )
  }
}
