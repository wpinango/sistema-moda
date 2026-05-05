import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const clientes = await prisma.cliente.findMany({
      include: {
        medidas: {
          orderBy: { fechaToma: 'desc' },
          take: 1
        },
        _count: {
          select: { prendas: true, cotizaciones: true }
        }
      },
      orderBy: { nombre: "asc" },
    })

    return NextResponse.json(clientes)
  } catch (error) {
    console.error("Error al obtener clientes:", error)
    return NextResponse.json(
      { error: "Error al obtener clientes" },
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
    const { nombre, email, telefono, direccion, notas, medidas } = body

    const cliente = await prisma.cliente.create({
      data: {
        nombre,
        email,
        telefono,
        direccion,
        notas,
        ...(medidas && {
          medidas: {
            create: {
              busto: medidas.busto ? parseFloat(medidas.busto) : null,
              cintura: medidas.cintura ? parseFloat(medidas.cintura) : null,
              cadera: medidas.cadera ? parseFloat(medidas.cadera) : null,
              largoManga: medidas.largoManga ? parseFloat(medidas.largoManga) : null,
              largoTotal: medidas.largoTotal ? parseFloat(medidas.largoTotal) : null,
              personalizadas: medidas.personalizadas || null,
              notas: medidas.notas || null,
            }
          }
        })
      },
      include: {
        medidas: true
      }
    })

    return NextResponse.json(cliente, { status: 201 })
  } catch (error) {
    console.error("Error al crear cliente:", error)
    return NextResponse.json(
      { error: "Error al crear cliente" },
      { status: 500 }
    )
  }
}
