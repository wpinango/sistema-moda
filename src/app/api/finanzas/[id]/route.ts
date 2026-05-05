import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await prisma.transaccion.delete({
      where: { id: params.id },
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
