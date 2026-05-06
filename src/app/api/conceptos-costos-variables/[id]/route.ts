import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const data: Record<string, unknown> = {}
    if (typeof body.nombre === "string") data.nombre = body.nombre.trim()
    if ("montoDefecto" in body) {
      data.montoDefecto =
        body.montoDefecto === null ||
        body.montoDefecto === undefined ||
        body.montoDefecto === ""
          ? null
          : parseFloat(String(body.montoDefecto))
    }
    if ("descripcion" in body) {
      data.descripcion =
        typeof body.descripcion === "string" && body.descripcion.trim()
          ? body.descripcion.trim()
          : null
    }
    if (typeof body.activo === "boolean") data.activo = body.activo

    const concepto = await prisma.conceptoCostoVariable.update({
      where: { id },
      data,
    })

    return NextResponse.json(concepto)
  } catch (error) {
    console.error("Error al actualizar concepto de costo variable:", error)
    return NextResponse.json(
      { error: "Error al actualizar concepto" },
      { status: 500 },
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    await prisma.conceptoCostoVariable.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Concepto eliminado" })
  } catch (error) {
    console.error("Error al eliminar concepto de costo variable:", error)
    return NextResponse.json(
      { error: "Error al eliminar concepto" },
      { status: 500 },
    )
  }
}
