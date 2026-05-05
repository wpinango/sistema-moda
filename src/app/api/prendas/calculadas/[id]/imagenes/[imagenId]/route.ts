import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { unlink } from "fs/promises"
import { join } from "path"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imagenId: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { imagenId } = await params
    
    // Obtener imagen
    const imagen = await prisma.imagenPrenda.findUnique({
      where: { id: imagenId }
    })

    if (!imagen) {
      return NextResponse.json(
        { error: "Imagen no encontrada" },
        { status: 404 }
      )
    }

    // Eliminar archivo físico
    try {
      const filePath = join(process.cwd(), "public", imagen.url)
      await unlink(filePath)
    } catch (fileError) {
      console.error("Error al eliminar archivo:", fileError)
      // Continuar aunque falle la eliminación del archivo
    }

    // Eliminar registro de BD
    await prisma.imagenPrenda.delete({
      where: { id: imagenId }
    })

    return NextResponse.json({ message: "Imagen eliminada" })
  } catch (error) {
    console.error("Error al eliminar imagen:", error)
    return NextResponse.json(
      { error: "Error al eliminar imagen" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imagenId: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id, imagenId } = await params
    const body = await request.json()
    const { esPrincipal } = body

    // Si se marca como principal, quitar el flag de las demás
    if (esPrincipal) {
      await prisma.imagenPrenda.updateMany({
        where: { 
          prendaCalculadaId: id,
          id: { not: imagenId }
        },
        data: { esPrincipal: false }
      })
    }

    // Actualizar imagen
    const imagen = await prisma.imagenPrenda.update({
      where: { id: imagenId },
      data: { esPrincipal }
    })

    return NextResponse.json(imagen)
  } catch (error) {
    console.error("Error al actualizar imagen:", error)
    return NextResponse.json(
      { error: "Error al actualizar imagen" },
      { status: 500 }
    )
  }
}
