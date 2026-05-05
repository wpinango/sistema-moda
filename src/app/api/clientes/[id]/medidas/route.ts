import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { busto, cintura, cadera, largoManga, largoTotal, personalizadas, notas } = body

    const medida = await prisma.medida.create({
      data: {
        clienteId: params.id,
        busto: busto ? parseFloat(busto) : null,
        cintura: cintura ? parseFloat(cintura) : null,
        cadera: cadera ? parseFloat(cadera) : null,
        largoManga: largoManga ? parseFloat(largoManga) : null,
        largoTotal: largoTotal ? parseFloat(largoTotal) : null,
        personalizadas: personalizadas || null,
        notas: notas || null,
      }
    })

    return NextResponse.json(medida, { status: 201 })
  } catch (error) {
    console.error("Error al crear medida:", error)
    return NextResponse.json(
      { error: "Error al crear medida" },
      { status: 500 }
    )
  }
}
