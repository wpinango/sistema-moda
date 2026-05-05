import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

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

    const costo = await prisma.costoFijo.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(costo)
  } catch (error) {
    console.error("Error al actualizar costo fijo:", error)
    return NextResponse.json(
      { error: "Error al actualizar costo fijo" },
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
    await prisma.costoFijo.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Costo fijo eliminado" })
  } catch (error) {
    console.error("Error al eliminar costo fijo:", error)
    return NextResponse.json(
      { error: "Error al eliminar costo fijo" },
      { status: 500 }
    )
  }
}
