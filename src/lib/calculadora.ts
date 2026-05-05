export interface CostoMaterial {
  materialId: string
  nombre: string
  cantidad: number
  costoUnitario: number
  unidad: string
}

export interface CalculoPrendaConfig {
  porcentajeCostosIndirectos: number
  margenPorcentaje: number
  descuentoDocena: number
}

export interface ResultadoCalculo {
  costoMateriales: number
  costoManoObra: number
  costosIndirectos: number
  costoTotalUnitario: number
  precioVentaUnitario: number
  precioDocena: number
  precioUnitarioEnDocena: number
  margenAplicado: number
  gananciaUnitaria: number
  materiales: CostoMaterial[]
}

// Configuración por defecto (se sobrescribe con valores de BD)
const CONFIG_DEFAULT: CalculoPrendaConfig = {
  porcentajeCostosIndirectos: 20, // 20% sobre materiales + mano de obra
  margenPorcentaje: 40, // 40% de ganancia
  descuentoDocena: 15, // 15% de descuento en docena
}

// Función para obtener configuración desde BD
export async function obtenerConfiguracion(): Promise<Partial<CalculoPrendaConfig>> {
  try {
    const response = await fetch('/api/configuracion')
    if (!response.ok) return {}

    const configs = await response.json()
    const config: Partial<CalculoPrendaConfig> = {}

    configs.forEach((c: any) => {
      switch (c.clave) {
        case 'porcentaje_costos_indirectos':
          config.porcentajeCostosIndirectos = parseFloat(c.valor)
          break
        case 'margen_ganancia_defecto':
          config.margenPorcentaje = parseFloat(c.valor)
          break
        case 'descuento_docena':
          config.descuentoDocena = parseFloat(c.valor)
          break
      }
    })

    return config
  } catch (error) {
    console.error('Error al obtener configuración:', error)
    return {}
  }
}

export function calcularCostosPrenda(
  materiales: CostoMaterial[],
  costoManoObra: number = 0,
  config: Partial<CalculoPrendaConfig> = {}
): ResultadoCalculo {

  const cfg = { ...CONFIG_DEFAULT, ...config }

  const costoMateriales = materiales.reduce(
    (total, m) => total + (m.cantidad * m.costoUnitario),
    0
  )

  const manoObra = Number.isFinite(costoManoObra) && costoManoObra > 0 ? costoManoObra : 0

  const costosIndirectos = (costoMateriales + manoObra) *
    (cfg.porcentajeCostosIndirectos / 100)

  const costoTotalUnitario = costoMateriales + manoObra + costosIndirectos

  const precioVentaUnitario = costoTotalUnitario * (1 + cfg.margenPorcentaje / 100)

  const precioUnitarioEnDocena = precioVentaUnitario * (1 - cfg.descuentoDocena / 100)
  const precioDocena = precioUnitarioEnDocena * 12

  return {
    costoMateriales: redondear(costoMateriales),
    costoManoObra: redondear(manoObra),
    costosIndirectos: redondear(costosIndirectos),
    costoTotalUnitario: redondear(costoTotalUnitario),
    precioVentaUnitario: redondear(precioVentaUnitario),
    precioDocena: redondear(precioDocena),
    precioUnitarioEnDocena: redondear(precioUnitarioEnDocena),
    margenAplicado: cfg.margenPorcentaje,
    gananciaUnitaria: redondear(precioVentaUnitario - costoTotalUnitario),
    materiales: materiales.map(m => ({
      ...m,
      subtotal: redondear(m.cantidad * m.costoUnitario)
    })) as any,
  }
}

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100
}

export function sugerirPrecioCompetitivo(
  costoTotal: number,
  margenMinimo: number = 30,
  margenMaximo: number = 60
): { precio: number; margen: number }[] {
  const sugerencias = []
  for (let m = margenMinimo; m <= margenMaximo; m += 5) {
    sugerencias.push({
      precio: redondear(costoTotal * (1 + m / 100)),
      margen: m
    })
  }
  return sugerencias
}
