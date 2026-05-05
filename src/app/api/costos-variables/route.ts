import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { prendaCalculadaId, concepto, monto, descripcion } = body

    const costoVariable = await prisma.costoVariable.create({
      data: {
        prendaCalculadaId,
        concepto,
        monto: parseFloat(monto),
        descripcion,
      },
    })

    return NextResponse.json(costoVariable, { status: 201 })
  } catch (error) {
    console.error("Error al crear costo variable:", error)
    return NextResponse.json(
      { error: "Error al crear costo variable" },
      { status: 500 }
    )
  }
}
