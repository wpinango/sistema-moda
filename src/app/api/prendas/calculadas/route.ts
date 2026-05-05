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
    const clienteId = searchParams.get("clienteId")
    const esReferencia = searchParams.get("esReferencia")
    const esParaInventario = searchParams.get("esParaInventario")

    const prendas = await prisma.prendaCalculada.findMany({
      where: {
        ...(clienteId && { clienteId }),
        ...(esReferencia !== null && { esReferencia: esReferencia === "true" }),
        ...(esParaInventario !== null && { esParaInventario: esParaInventario === "true" }),
      },
      include: {
        prendaBase: true,
        cliente: true,
        materiales: {
          include: {
            material: true
          }
        },
        imagenes: {
          orderBy: [{ esPrincipal: 'desc' }, { orden: 'asc' }]
        }
      },
      orderBy: { fechaCalculo: "desc" },
    })

    return NextResponse.json(prendas)
  } catch (error) {
    console.error("Error al obtener prendas calculadas:", error)
    return NextResponse.json(
      { error: "Error al obtener prendas calculadas" },
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
    const {
      nombre,
      prendaBaseId,
      clienteId,
      talla,
      costoMateriales,
      costoManoObra,
      costosIndirectos,
      costoTotalUnitario,
      precioVentaUnitario,
      precioVentaDocena,
      margenAplicadoPct,
      tiempoRealMin,
      notasTecnicas,
      esParaInventario,
      cantidadInventario,
      stockMinimo,
      esReferencia,
      materiales,
    } = body

    const prenda = await prisma.prendaCalculada.create({
      data: {
        nombre,
        prendaBaseId: prendaBaseId || null,
        clienteId: clienteId || null,
        talla,
        costoMateriales: parseFloat(costoMateriales),
        costoManoObra: parseFloat(costoManoObra),
        costosIndirectos: parseFloat(costosIndirectos),
        costoTotalUnitario: parseFloat(costoTotalUnitario),
        precioVentaUnitario: parseFloat(precioVentaUnitario),
        precioVentaDocena: parseFloat(precioVentaDocena),
        margenAplicadoPct: parseFloat(margenAplicadoPct),
        tiempoRealMin: tiempoRealMin ? parseInt(tiempoRealMin) : null,
        notasTecnicas,
        esParaInventario: esParaInventario || false,
        cantidadInventario: cantidadInventario ? parseInt(cantidadInventario) : 0,
        stockMinimo: stockMinimo ? parseInt(stockMinimo) : 0,
        esReferencia: esReferencia ?? true,
        materiales: {
          create: materiales?.map((m: any) => ({
            materialId: m.materialId,
            cantidadUsada: parseFloat(m.cantidadUsada),
            costoUnitario: parseFloat(m.costoUnitario),
            costoTotal: parseFloat(m.costoTotal),
          })) || []
        }
      },
      include: {
        prendaBase: true,
        cliente: true,
        materiales: {
          include: {
            material: true
          }
        }
      }
    })

    return NextResponse.json(prenda, { status: 201 })
  } catch (error) {
    console.error("Error al crear prenda calculada:", error)
    return NextResponse.json(
      { error: "Error al crear prenda calculada" },
      { status: 500 }
    )
  }
}
