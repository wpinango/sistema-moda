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
    const soloActivos = searchParams.get("activo") === "true"

    const conceptos = await prisma.conceptoCostoVariable.findMany({
      where: soloActivos ? { activo: true } : undefined,
      orderBy: { nombre: "asc" },
    })

    return NextResponse.json(conceptos)
  } catch (error) {
    console.error("Error al obtener conceptos de costos variables:", error)
    return NextResponse.json(
      { error: "Error al obtener conceptos" },
      { status: 500 },
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
    const { nombre, montoDefecto, descripcion } = body

    if (!nombre || typeof nombre !== "string" || !nombre.trim()) {
      return NextResponse.json(
        { error: "El nombre es requerido" },
        { status: 400 },
      )
    }

    const concepto = await prisma.conceptoCostoVariable.create({
      data: {
        nombre: nombre.trim(),
        montoDefecto:
          montoDefecto === null ||
          montoDefecto === undefined ||
          montoDefecto === ""
            ? null
            : parseFloat(String(montoDefecto)),
        descripcion: descripcion?.trim() || null,
      },
    })

    return NextResponse.json(concepto, { status: 201 })
  } catch (error) {
    console.error("Error al crear concepto de costo variable:", error)
    return NextResponse.json(
      { error: "Error al crear concepto" },
      { status: 500 },
    )
  }
}
