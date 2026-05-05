import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

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
    await prisma.transaccion.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Transacción eliminada" })
  } catch (error) {
    console.error("Error al eliminar transacción:", error)
    return NextResponse.json(
      { error: "Error al eliminar transacción" },
      { status: 500 }
    )
  }
}
