import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { writeFile } from "fs/promises"
import { join } from "path"

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
    const imagenes = await prisma.imagenPrenda.findMany({
      where: { prendaCalculadaId: id },
      orderBy: [{ esPrincipal: 'desc' }, { orden: 'asc' }],
    })

    return NextResponse.json(imagenes)
  } catch (error) {
    console.error("Error al obtener imágenes:", error)
    return NextResponse.json(
      { error: "Error al obtener imágenes" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = await params
    
    // Verificar que no tenga más de 5 imágenes
    const count = await prisma.imagenPrenda.count({
      where: { prendaCalculadaId: id }
    })

    if (count >= 5) {
      return NextResponse.json(
        { error: "Máximo 5 imágenes por prenda" },
        { status: 400 }
      )
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const esPrincipal = formData.get("esPrincipal") === "true"

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó archivo" },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "El archivo debe ser una imagen" },
        { status: 400 }
      )
    }

    // Crear nombre único para el archivo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const timestamp = Date.now()
    const fileName = `${id}_${timestamp}_${file.name}`
    const path = join(process.cwd(), "public", "uploads", "prendas", fileName)

    // Guardar archivo
    await writeFile(path, buffer)

    // Si es principal, quitar el flag de las demás
    if (esPrincipal) {
      await prisma.imagenPrenda.updateMany({
        where: { prendaCalculadaId: id },
        data: { esPrincipal: false }
      })
    }

    // Crear registro en BD
    const imagen = await prisma.imagenPrenda.create({
      data: {
        prendaCalculadaId: id,
        url: `/uploads/prendas/${fileName}`,
        nombre: file.name,
        orden: count,
        esPrincipal,
      }
    })

    return NextResponse.json(imagen, { status: 201 })
  } catch (error) {
    console.error("Error al subir imagen:", error)
    return NextResponse.json(
      { error: "Error al subir imagen" },
      { status: 500 }
    )
  }
}
