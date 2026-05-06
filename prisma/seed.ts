import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function limpiar() {
  // Orden respetando FKs (más dependientes primero)
  await prisma.imagenPrenda.deleteMany()
  await prisma.costoVariable.deleteMany()
  await prisma.prendaCalculadaMaterial.deleteMany()
  await prisma.cotizacion.deleteMany()
  await prisma.prendaCalculada.deleteMany()
  await prisma.prendaBaseMaterial.deleteMany()
  await prisma.prendaBase.deleteMany()
  await prisma.medida.deleteMany()
  await prisma.cliente.deleteMany()
  await prisma.material.deleteMany()
  await prisma.transaccion.deleteMany()
  await prisma.conceptoCostoVariable.deleteMany()
  await prisma.costoFijo.deleteMany()
  await prisma.configuracion.deleteMany()
  await prisma.usuario.deleteMany()
}

async function main() {
  console.log("🧹 Limpiando datos existentes...")
  await limpiar()

  console.log("👤 Creando usuario admin...")
  const password = await bcrypt.hash("admin123", 10)
  await prisma.usuario.create({
    data: {
      nombre: "Diseñadora",
      email: "admin@moda.com",
      password,
      rol: "ADMIN",
    },
  })

  console.log("⚙️  Configuración del sistema...")
  await prisma.configuracion.createMany({
    data: [
      { clave: "porcentaje_costos_indirectos", valor: "20" },
      { clave: "margen_ganancia_defecto", valor: "45" },
      { clave: "descuento_docena", valor: "12" },
      { clave: "moneda", valor: "USD" },
      { clave: "nombre_taller", valor: "Taller de Diseño" },
    ],
  })

  console.log("🏠 Costos fijos mensuales del taller...")
  await prisma.costoFijo.createMany({
    data: [
      {
        nombre: "Alquiler taller",
        monto: 380,
        periodicidad: "MENSUAL",
        descripcion: "Espacio de 40m² con luz natural",
      },
      { nombre: "Energía eléctrica", monto: 65, periodicidad: "MENSUAL" },
      { nombre: "Agua", monto: 18, periodicidad: "MENSUAL" },
      { nombre: "Internet y teléfono", monto: 35, periodicidad: "MENSUAL" },
      {
        nombre: "Mantenimiento máquinas",
        monto: 40,
        periodicidad: "MENSUAL",
        descripcion: "Engrase y revisión de máquinas industriales",
      },
      { nombre: "Software de diseño", monto: 22, periodicidad: "MENSUAL" },
      {
        nombre: "Asistente medio tiempo",
        monto: 450,
        periodicidad: "MENSUAL",
        descripcion: "20 horas semanales",
      },
      {
        nombre: "Seguro del taller",
        monto: 240,
        periodicidad: "ANUAL",
      },
    ],
  })

  console.log("🏷️  Conceptos de costos variables (catálogo)...")
  await prisma.conceptoCostoVariable.createMany({
    data: [
      {
        nombre: "Empaque básico",
        montoDefecto: 1.2,
        descripcion: "Bolsa kraft + papel de seda",
      },
      {
        nombre: "Empaque premium",
        montoDefecto: 3.5,
        descripcion: "Caja rígida con cinta y lazo",
      },
      {
        nombre: "Hangtag de marca",
        montoDefecto: 0.4,
        descripcion: "Etiqueta colgante con hilo encerado",
      },
      {
        nombre: "Bordado a mano",
        montoDefecto: 12,
        descripcion: "Personalización con iniciales o motivo simple",
      },
      {
        nombre: "Servicio de plancha",
        montoDefecto: 1.5,
      },
      {
        nombre: "Transporte / mensajería",
        montoDefecto: 4,
        descripcion: "Entrega local",
      },
      {
        nombre: "Lavado especial",
        montoDefecto: 6,
        descripcion: "Para telas delicadas o con tintes",
      },
      {
        nombre: "Pasamanería extra",
        montoDefecto: null,
        descripcion: "Apliques, encajes adicionales — monto variable",
      },
    ],
  })

  console.log("🧵 Materiales del inventario...")
  // ----- TELAS -----
  await prisma.material.create({
    data: {
      nombre: "Algodón liso",
      tipo: "TELA",
      unidadMedida: "METRO",
      stockActual: 80,
      stockMinimo: 15,
      costoUnitario: 4.2,
      proveedor: "Textiles del Norte",
      color: "Variado",
    },
  })
  const algodonOrganico = await prisma.material.create({
    data: {
      nombre: "Algodón orgánico premium",
      tipo: "TELA",
      unidadMedida: "METRO",
      stockActual: 35,
      stockMinimo: 10,
      costoUnitario: 7.8,
      proveedor: "EcoTextil",
      color: "Crudo",
    },
  })
  const lino = await prisma.material.create({
    data: {
      nombre: "Lino europeo",
      tipo: "TELA",
      unidadMedida: "METRO",
      stockActual: 22,
      stockMinimo: 5,
      costoUnitario: 11.5,
      proveedor: "Importadora Linum",
      color: "Beige",
    },
  })
  const sedaSatinada = await prisma.material.create({
    data: {
      nombre: "Seda satinada",
      tipo: "TELA",
      unidadMedida: "METRO",
      stockActual: 18,
      stockMinimo: 5,
      costoUnitario: 16.5,
      proveedor: "Telas Premium SA",
      color: "Marfil",
    },
  })
  const gabardina = await prisma.material.create({
    data: {
      nombre: "Gabardina stretch",
      tipo: "TELA",
      unidadMedida: "METRO",
      stockActual: 45,
      stockMinimo: 10,
      costoUnitario: 6.8,
      proveedor: "Textiles del Norte",
      color: "Negro",
    },
  })
  const jersey = await prisma.material.create({
    data: {
      nombre: "Jersey de algodón",
      tipo: "TELA",
      unidadMedida: "METRO",
      stockActual: 60,
      stockMinimo: 12,
      costoUnitario: 5.5,
      proveedor: "Textiles del Norte",
    },
  })
  const tul = await prisma.material.create({
    data: {
      nombre: "Tul bordado",
      tipo: "TELA",
      unidadMedida: "METRO",
      stockActual: 12,
      stockMinimo: 3,
      costoUnitario: 9.2,
      proveedor: "Encajes y Tules SA",
      color: "Blanco",
    },
  })
  const denim = await prisma.material.create({
    data: {
      nombre: "Denim 12oz",
      tipo: "TELA",
      unidadMedida: "METRO",
      stockActual: 28,
      stockMinimo: 8,
      costoUnitario: 7.5,
      proveedor: "Jeans Wholesale",
      color: "Azul medio",
    },
  })

  // ----- HILOS -----
  const hiloPoliester = await prisma.material.create({
    data: {
      nombre: "Hilo poliéster cono 5000y",
      tipo: "HILO",
      unidadMedida: "UNIDAD",
      stockActual: 40,
      stockMinimo: 10,
      costoUnitario: 1.8,
    },
  })
  const hiloDecorativo = await prisma.material.create({
    data: {
      nombre: "Hilo decorativo metalizado",
      tipo: "HILO",
      unidadMedida: "UNIDAD",
      stockActual: 15,
      stockMinimo: 4,
      costoUnitario: 4.2,
      color: "Dorado",
    },
  })

  // ----- BOTONES -----
  await prisma.material.create({
    data: {
      nombre: "Botón plástico básico 12mm",
      tipo: "BOTON",
      unidadMedida: "UNIDAD",
      stockActual: 800,
      stockMinimo: 100,
      costoUnitario: 0.08,
    },
  })
  const botonNacar = await prisma.material.create({
    data: {
      nombre: "Botón nácar 15mm",
      tipo: "BOTON",
      unidadMedida: "UNIDAD",
      stockActual: 240,
      stockMinimo: 50,
      costoUnitario: 0.65,
      color: "Nácar",
    },
  })
  const botonMetal = await prisma.material.create({
    data: {
      nombre: "Botón metálico mate 18mm",
      tipo: "BOTON",
      unidadMedida: "UNIDAD",
      stockActual: 180,
      stockMinimo: 40,
      costoUnitario: 0.45,
      color: "Plata envejecida",
    },
  })

  // ----- CIERRES -----
  const cierreInvisible20 = await prisma.material.create({
    data: {
      nombre: "Cremallera invisible 20cm",
      tipo: "CREMALLERA",
      unidadMedida: "UNIDAD",
      stockActual: 60,
      stockMinimo: 15,
      costoUnitario: 1.1,
    },
  })
  const cierreMetal60 = await prisma.material.create({
    data: {
      nombre: "Cremallera metálica 60cm",
      tipo: "CREMALLERA",
      unidadMedida: "UNIDAD",
      stockActual: 25,
      stockMinimo: 8,
      costoUnitario: 2.6,
      color: "Bronce",
    },
  })

  // ----- AVÍOS / OTROS -----
  const entretela = await prisma.material.create({
    data: {
      nombre: "Entretela fusionable",
      tipo: "OTRO",
      unidadMedida: "METRO",
      stockActual: 70,
      stockMinimo: 15,
      costoUnitario: 1.9,
    },
  })
  const elastico = await prisma.material.create({
    data: {
      nombre: "Elástico de cintura 2cm",
      tipo: "OTRO",
      unidadMedida: "METRO",
      stockActual: 90,
      stockMinimo: 20,
      costoUnitario: 0.35,
    },
  })
  const etiquetaMarca = await prisma.material.create({
    data: {
      nombre: "Etiqueta tejida de marca",
      tipo: "OTRO",
      unidadMedida: "UNIDAD",
      stockActual: 1500,
      stockMinimo: 200,
      costoUnitario: 0.12,
    },
  })
  const forreria = await prisma.material.create({
    data: {
      nombre: "Forrería de viscosa",
      tipo: "TELA",
      unidadMedida: "METRO",
      stockActual: 25,
      stockMinimo: 8,
      costoUnitario: 3.2,
      color: "Negro",
    },
  })

  console.log("👗 Prendas base (plantillas)...")

  const camiseta = await prisma.prendaBase.create({
    data: {
      nombre: "Camiseta básica jersey",
      categoria: "CAMISA",
      complejidad: "BAJA",
      tiempoEstimadoMin: 50,
      margenSugeridoPct: 50,
      descripcion: "Manga corta, cuello redondo, algodón jersey",
      materiales: {
        create: [
          { materialId: jersey.id, cantidad: 1.1, esObligatorio: true },
          { materialId: hiloPoliester.id, cantidad: 0.5, esObligatorio: true },
          { materialId: etiquetaMarca.id, cantidad: 1, esObligatorio: true },
        ],
      },
    },
  })

  const blusaSeda = await prisma.prendaBase.create({
    data: {
      nombre: "Blusa manga larga seda",
      categoria: "BLUSA",
      complejidad: "MEDIA",
      tiempoEstimadoMin: 180,
      margenSugeridoPct: 50,
      descripcion: "Blusa formal en seda, cuello camisero, puño francés",
      materiales: {
        create: [
          { materialId: sedaSatinada.id, cantidad: 1.6, esObligatorio: true },
          { materialId: hiloPoliester.id, cantidad: 1, esObligatorio: true },
          { materialId: botonNacar.id, cantidad: 7, esObligatorio: true },
          { materialId: entretela.id, cantidad: 0.4, esObligatorio: true },
          { materialId: etiquetaMarca.id, cantidad: 1, esObligatorio: true },
        ],
      },
    },
  })

  const vestidoLino = await prisma.prendaBase.create({
    data: {
      nombre: "Vestido midi lino",
      categoria: "VESTIDO",
      complejidad: "MEDIA",
      tiempoEstimadoMin: 240,
      margenSugeridoPct: 50,
      descripcion: "Vestido sin mangas con cintura marcada y cierre invisible",
      materiales: {
        create: [
          { materialId: lino.id, cantidad: 2.4, esObligatorio: true },
          { materialId: hiloPoliester.id, cantidad: 1, esObligatorio: true },
          { materialId: cierreInvisible20.id, cantidad: 1, esObligatorio: true },
          { materialId: forreria.id, cantidad: 1.4, esObligatorio: true },
          { materialId: etiquetaMarca.id, cantidad: 1, esObligatorio: true },
        ],
      },
    },
  })

  await prisma.prendaBase.create({
    data: {
      nombre: "Vestido de noche con tul",
      categoria: "VESTIDO",
      complejidad: "ALTA",
      tiempoEstimadoMin: 480,
      margenSugeridoPct: 60,
      descripcion: "Vestido largo con cuerpo en seda y falda de tul bordado",
      materiales: {
        create: [
          { materialId: sedaSatinada.id, cantidad: 1.8, esObligatorio: true },
          { materialId: tul.id, cantidad: 3, esObligatorio: true },
          { materialId: hiloPoliester.id, cantidad: 2, esObligatorio: true },
          { materialId: hiloDecorativo.id, cantidad: 1, esObligatorio: false },
          { materialId: cierreInvisible20.id, cantidad: 1, esObligatorio: true },
          { materialId: forreria.id, cantidad: 1.6, esObligatorio: true },
          { materialId: etiquetaMarca.id, cantidad: 1, esObligatorio: true },
        ],
      },
    },
  })

  const pantalonSastre = await prisma.prendaBase.create({
    data: {
      nombre: "Pantalón sastre gabardina",
      categoria: "PANTALON",
      complejidad: "MEDIA",
      tiempoEstimadoMin: 220,
      margenSugeridoPct: 45,
      descripcion: "Corte recto, pretina con presilla, bolsillos italianos",
      materiales: {
        create: [
          { materialId: gabardina.id, cantidad: 1.6, esObligatorio: true },
          { materialId: hiloPoliester.id, cantidad: 1, esObligatorio: true },
          { materialId: cierreInvisible20.id, cantidad: 1, esObligatorio: true },
          { materialId: botonMetal.id, cantidad: 1, esObligatorio: true },
          { materialId: entretela.id, cantidad: 0.3, esObligatorio: true },
          { materialId: forreria.id, cantidad: 0.6, esObligatorio: true },
          { materialId: etiquetaMarca.id, cantidad: 1, esObligatorio: true },
        ],
      },
    },
  })

  const faldaMidi = await prisma.prendaBase.create({
    data: {
      nombre: "Falda midi algodón",
      categoria: "FALDA",
      complejidad: "BAJA",
      tiempoEstimadoMin: 130,
      margenSugeridoPct: 50,
      descripcion: "Falda midi con elástico en cintura",
      materiales: {
        create: [
          { materialId: algodonOrganico.id, cantidad: 1.4, esObligatorio: true },
          { materialId: hiloPoliester.id, cantidad: 0.7, esObligatorio: true },
          { materialId: elastico.id, cantidad: 0.8, esObligatorio: true },
          { materialId: etiquetaMarca.id, cantidad: 1, esObligatorio: true },
        ],
      },
    },
  })

  await prisma.prendaBase.create({
    data: {
      nombre: "Blazer entallado",
      categoria: "CHAQUETA",
      complejidad: "ALTA",
      tiempoEstimadoMin: 360,
      margenSugeridoPct: 55,
      descripcion: "Blazer con solapa, dos botones y forro completo",
      materiales: {
        create: [
          { materialId: gabardina.id, cantidad: 1.9, esObligatorio: true },
          { materialId: forreria.id, cantidad: 1.7, esObligatorio: true },
          { materialId: hiloPoliester.id, cantidad: 1.5, esObligatorio: true },
          { materialId: botonMetal.id, cantidad: 4, esObligatorio: true },
          { materialId: entretela.id, cantidad: 1.2, esObligatorio: true },
          { materialId: etiquetaMarca.id, cantidad: 1, esObligatorio: true },
        ],
      },
    },
  })

  await prisma.prendaBase.create({
    data: {
      nombre: "Jeans clásicos",
      categoria: "PANTALON",
      complejidad: "MEDIA",
      tiempoEstimadoMin: 200,
      margenSugeridoPct: 50,
      descripcion: "Cinco bolsillos, cierre metálico, pretina con presilla",
      materiales: {
        create: [
          { materialId: denim.id, cantidad: 1.5, esObligatorio: true },
          { materialId: hiloPoliester.id, cantidad: 1, esObligatorio: true },
          { materialId: cierreMetal60.id, cantidad: 1, esObligatorio: true },
          { materialId: botonMetal.id, cantidad: 1, esObligatorio: true },
          { materialId: etiquetaMarca.id, cantidad: 1, esObligatorio: true },
        ],
      },
    },
  })

  console.log("👥 Clientes con medidas...")

  const cliMaria = await prisma.cliente.create({
    data: {
      nombre: "María García López",
      email: "maria.garcia@email.com",
      telefono: "+57 311 234 5678",
      direccion: "Cra 13 #45-23, Bogotá",
      notas: "Cliente frecuente, prefiere colores tierra",
      medidas: {
        create: {
          busto: 88,
          cintura: 68,
          cadera: 94,
          largoManga: 58,
          largoTotal: 148,
          notas: "Talla M",
        },
      },
    },
  })

  const cliCamila = await prisma.cliente.create({
    data: {
      nombre: "Camila Restrepo",
      email: "camila.r@email.com",
      telefono: "+57 320 456 7890",
      direccion: "Calle 70 #12-34, Medellín",
      notas: "Solicita acabados a mano. Muy detallista.",
      medidas: {
        create: {
          busto: 84,
          cintura: 64,
          cadera: 90,
          largoManga: 56,
          largoTotal: 142,
          personalizadas: [
            { titulo: "Hombros", valor: 38 },
            { titulo: "Largo espalda", valor: 41 },
          ],
          notas: "Talla S, espalda angosta",
        },
      },
    },
  })

  const cliValentina = await prisma.cliente.create({
    data: {
      nombre: "Valentina Ortiz",
      email: "valentina.o@email.com",
      telefono: "+57 315 678 9012",
      direccion: "Av. 6N #28-15, Cali",
      medidas: {
        create: {
          busto: 92,
          cintura: 74,
          cadera: 100,
          largoManga: 60,
          largoTotal: 154,
          notas: "Talla L",
        },
      },
    },
  })

  const cliSofia = await prisma.cliente.create({
    data: {
      nombre: "Sofía Moreno",
      email: "sofia.moreno@email.com",
      telefono: "+57 313 222 4455",
      notas: "Clienta nueva, referida por María García",
      medidas: {
        create: {
          busto: 86,
          cintura: 66,
          cadera: 92,
          largoTotal: 145,
        },
      },
    },
  })

  await prisma.cliente.create({
    data: {
      nombre: "Laura Hincapié",
      telefono: "+57 318 555 7788",
      direccion: "Barrio Laureles, Medellín",
      notas: "Pide bordados personalizados frecuentemente",
      medidas: {
        create: {
          busto: 90,
          cintura: 71,
          cadera: 97,
          largoManga: 59,
          largoTotal: 150,
          personalizadas: [{ titulo: "Pierna", valor: 105 }],
        },
      },
    },
  })

  await prisma.cliente.create({
    data: {
      nombre: "Daniela Vargas",
      email: "daniela.v@email.com",
      telefono: "+57 312 901 2345",
    },
  })

  console.log("📐 Prendas calculadas (historial)...")

  // Helper para calcular costos basado en config (20% indirectos, 45% margen, 12% desc docena)
  const calcular = (
    costoMateriales: number,
    costoManoObra: number,
    margenPct: number,
  ) => {
    const indirectos = (costoMateriales + costoManoObra) * 0.2
    const totalUnitario = costoMateriales + costoManoObra + indirectos
    const precio = totalUnitario * (1 + margenPct / 100)
    const precioDocena = precio * (1 - 0.12) * 12
    return {
      costoMateriales: Number(costoMateriales.toFixed(2)),
      costoManoObra: Number(costoManoObra.toFixed(2)),
      costosIndirectos: Number(indirectos.toFixed(2)),
      costoTotalUnitario: Number(totalUnitario.toFixed(2)),
      precioVentaUnitario: Number(precio.toFixed(2)),
      precioVentaDocena: Number(precioDocena.toFixed(2)),
      margenAplicadoPct: margenPct,
    }
  }

  // 1) Camiseta para María
  const camiCalc = calcular(
    1.1 * 5.5 + 0.5 * 1.8 + 1 * 0.12, // ≈ 7.07
    6, // mano de obra ingresada
    50,
  )
  const camiPrenda = await prisma.prendaCalculada.create({
    data: {
      prendaBaseId: camiseta.id,
      clienteId: cliMaria.id,
      nombre: "Camiseta básica para María",
      talla: "M",
      ...camiCalc,
      esReferencia: true,
      materiales: {
        create: [
          {
            materialId: jersey.id,
            cantidadUsada: 1.1,
            costoUnitario: 5.5,
            costoTotal: 6.05,
          },
          {
            materialId: hiloPoliester.id,
            cantidadUsada: 0.5,
            costoUnitario: 1.8,
            costoTotal: 0.9,
          },
          {
            materialId: etiquetaMarca.id,
            cantidadUsada: 1,
            costoUnitario: 0.12,
            costoTotal: 0.12,
          },
        ],
      },
      costosVariables: {
        create: [
          { concepto: "Empaque básico", monto: 1.2, descripcion: "Bolsa kraft" },
          { concepto: "Hangtag de marca", monto: 0.4 },
        ],
      },
    },
  })

  // 2) Blusa de seda para Camila (con bordado)
  const blusaCalc = calcular(
    1.6 * 16.5 + 1 * 1.8 + 7 * 0.65 + 0.4 * 1.9 + 0.12, // ≈ 33.59
    18,
    50,
  )
  await prisma.prendaCalculada.create({
    data: {
      prendaBaseId: blusaSeda.id,
      clienteId: cliCamila.id,
      nombre: "Blusa de seda con bordado para Camila",
      talla: "S",
      ...blusaCalc,
      esReferencia: true,
      materiales: {
        create: [
          {
            materialId: sedaSatinada.id,
            cantidadUsada: 1.6,
            costoUnitario: 16.5,
            costoTotal: 26.4,
          },
          {
            materialId: hiloPoliester.id,
            cantidadUsada: 1,
            costoUnitario: 1.8,
            costoTotal: 1.8,
          },
          {
            materialId: botonNacar.id,
            cantidadUsada: 7,
            costoUnitario: 0.65,
            costoTotal: 4.55,
          },
          {
            materialId: entretela.id,
            cantidadUsada: 0.4,
            costoUnitario: 1.9,
            costoTotal: 0.76,
          },
          {
            materialId: etiquetaMarca.id,
            cantidadUsada: 1,
            costoUnitario: 0.12,
            costoTotal: 0.12,
          },
        ],
      },
      costosVariables: {
        create: [
          { concepto: "Bordado a mano", monto: 12, descripcion: "Iniciales en puño" },
          { concepto: "Empaque premium", monto: 3.5 },
          { concepto: "Hangtag de marca", monto: 0.4 },
        ],
      },
    },
  })

  // 3) Vestido midi lino para Valentina
  const vestidoCalc = calcular(
    2.4 * 11.5 + 1 * 1.8 + 1 * 1.1 + 1.4 * 3.2 + 0.12, // ≈ 35.10
    24,
    50,
  )
  const vestidoPrenda = await prisma.prendaCalculada.create({
    data: {
      prendaBaseId: vestidoLino.id,
      clienteId: cliValentina.id,
      nombre: "Vestido midi de lino para Valentina",
      talla: "L",
      ...vestidoCalc,
      esReferencia: true,
      materiales: {
        create: [
          {
            materialId: lino.id,
            cantidadUsada: 2.4,
            costoUnitario: 11.5,
            costoTotal: 27.6,
          },
          {
            materialId: hiloPoliester.id,
            cantidadUsada: 1,
            costoUnitario: 1.8,
            costoTotal: 1.8,
          },
          {
            materialId: cierreInvisible20.id,
            cantidadUsada: 1,
            costoUnitario: 1.1,
            costoTotal: 1.1,
          },
          {
            materialId: forreria.id,
            cantidadUsada: 1.4,
            costoUnitario: 3.2,
            costoTotal: 4.48,
          },
          {
            materialId: etiquetaMarca.id,
            cantidadUsada: 1,
            costoUnitario: 0.12,
            costoTotal: 0.12,
          },
        ],
      },
      costosVariables: {
        create: [
          { concepto: "Empaque premium", monto: 3.5 },
          { concepto: "Servicio de plancha", monto: 1.5 },
        ],
      },
    },
  })

  // 4) Falda midi para inventario (referencia)
  const faldaCalc = calcular(
    1.4 * 7.8 + 0.7 * 1.8 + 0.8 * 0.35 + 0.12, // ≈ 12.49
    9,
    50,
  )
  await prisma.prendaCalculada.create({
    data: {
      prendaBaseId: faldaMidi.id,
      nombre: "Falda midi algodón crudo",
      talla: "M",
      ...faldaCalc,
      esParaInventario: true,
      cantidadInventario: 8,
      stockMinimo: 2,
      esReferencia: true,
      materiales: {
        create: [
          {
            materialId: algodonOrganico.id,
            cantidadUsada: 1.4,
            costoUnitario: 7.8,
            costoTotal: 10.92,
          },
          {
            materialId: hiloPoliester.id,
            cantidadUsada: 0.7,
            costoUnitario: 1.8,
            costoTotal: 1.26,
          },
          {
            materialId: elastico.id,
            cantidadUsada: 0.8,
            costoUnitario: 0.35,
            costoTotal: 0.28,
          },
          {
            materialId: etiquetaMarca.id,
            cantidadUsada: 1,
            costoUnitario: 0.12,
            costoTotal: 0.12,
          },
        ],
      },
    },
  })

  // 5) Pantalón sastre - referencia para inventario
  const pantalonCalc = calcular(
    1.6 * 6.8 + 1 * 1.8 + 1 * 1.1 + 1 * 0.45 + 0.3 * 1.9 + 0.6 * 3.2 + 0.12, // ≈ 16.50
    14,
    45,
  )
  await prisma.prendaCalculada.create({
    data: {
      prendaBaseId: pantalonSastre.id,
      nombre: "Pantalón sastre negro",
      talla: "M",
      ...pantalonCalc,
      esParaInventario: true,
      cantidadInventario: 5,
      stockMinimo: 2,
      esReferencia: true,
      materiales: {
        create: [
          {
            materialId: gabardina.id,
            cantidadUsada: 1.6,
            costoUnitario: 6.8,
            costoTotal: 10.88,
          },
          {
            materialId: hiloPoliester.id,
            cantidadUsada: 1,
            costoUnitario: 1.8,
            costoTotal: 1.8,
          },
          {
            materialId: cierreInvisible20.id,
            cantidadUsada: 1,
            costoUnitario: 1.1,
            costoTotal: 1.1,
          },
          {
            materialId: botonMetal.id,
            cantidadUsada: 1,
            costoUnitario: 0.45,
            costoTotal: 0.45,
          },
          {
            materialId: entretela.id,
            cantidadUsada: 0.3,
            costoUnitario: 1.9,
            costoTotal: 0.57,
          },
          {
            materialId: forreria.id,
            cantidadUsada: 0.6,
            costoUnitario: 3.2,
            costoTotal: 1.92,
          },
          {
            materialId: etiquetaMarca.id,
            cantidadUsada: 1,
            costoUnitario: 0.12,
            costoTotal: 0.12,
          },
        ],
      },
    },
  })

  console.log("📄 Cotizaciones...")

  await prisma.cotizacion.create({
    data: {
      numero: "COT-2026-001",
      clienteId: cliMaria.id,
      prendaCalculadaId: camiPrenda.id,
      estado: "PAGADO",
      subtotal: camiCalc.precioVentaUnitario,
      descuento: 0,
      total: camiCalc.precioVentaUnitario,
      fechaEntrega: new Date("2026-04-20"),
      notas: "Cliente recogió en taller",
    },
  })

  await prisma.cotizacion.create({
    data: {
      numero: "COT-2026-002",
      clienteId: cliValentina.id,
      prendaCalculadaId: vestidoPrenda.id,
      estado: "EN_PROCESO",
      subtotal: vestidoCalc.precioVentaUnitario,
      descuento: 5,
      total: vestidoCalc.precioVentaUnitario - 5,
      fechaEntrega: new Date("2026-05-25"),
      notas: "Entrega contra reembolso, descuento por referido",
    },
  })

  await prisma.cotizacion.create({
    data: {
      numero: "COT-2026-003",
      clienteId: cliSofia.id,
      estado: "COTIZADO",
      subtotal: 95,
      descuento: 0,
      total: 95,
      notas: "Pendiente de aprobación: blusa de seda",
    },
  })

  console.log("💰 Transacciones (finanzas)...")

  const hoy = new Date()
  const dia = (offset: number) => {
    const d = new Date(hoy)
    d.setDate(d.getDate() - offset)
    return d
  }

  await prisma.transaccion.createMany({
    data: [
      {
        tipo: "INGRESO",
        concepto: "Venta camiseta - María García (COT-2026-001)",
        monto: camiCalc.precioVentaUnitario,
        fecha: dia(2),
        categoria: "Venta",
        referencia: "COT-2026-001",
      },
      {
        tipo: "INGRESO",
        concepto: "Anticipo vestido - Valentina Ortiz (COT-2026-002)",
        monto: 40,
        fecha: dia(5),
        categoria: "Anticipo",
        referencia: "COT-2026-002",
      },
      {
        tipo: "INGRESO",
        concepto: "Venta falda inventario",
        monto: 28,
        fecha: dia(8),
        categoria: "Venta",
      },
      {
        tipo: "INGRESO",
        concepto: "Venta pantalón sastre inventario",
        monto: 36,
        fecha: dia(12),
        categoria: "Venta",
      },
      {
        tipo: "EGRESO_MATERIAL",
        concepto: "Compra de seda satinada (12m)",
        monto: 198,
        fecha: dia(15),
        categoria: "Compra material",
        notas: "Telas Premium SA",
      },
      {
        tipo: "EGRESO_MATERIAL",
        concepto: "Compra de hilos varios",
        monto: 36,
        fecha: dia(18),
        categoria: "Compra material",
      },
      {
        tipo: "EGRESO_SERVICIO",
        concepto: "Pago alquiler taller mayo",
        monto: 380,
        fecha: dia(20),
        categoria: "Alquiler",
      },
      {
        tipo: "EGRESO_SERVICIO",
        concepto: "Energía eléctrica",
        monto: 65,
        fecha: dia(22),
        categoria: "Servicios",
      },
      {
        tipo: "EGRESO_SERVICIO",
        concepto: "Internet y teléfono",
        monto: 35,
        fecha: dia(22),
        categoria: "Servicios",
      },
      {
        tipo: "EGRESO_OTRO",
        concepto: "Pago asistente medio tiempo",
        monto: 450,
        fecha: dia(25),
        categoria: "Personal",
      },
    ],
  })

  console.log("")
  console.log("🎉 Seed completado exitosamente!")
  console.log("")
  console.log("📧 Datos de acceso:")
  console.log("   Email: admin@moda.com")
  console.log("   Password: admin123")
  console.log("")
  console.log("📊 Datos creados:")
  console.log("   • 1 usuario admin")
  console.log("   • 5 configuraciones del sistema")
  console.log("   • 8 costos fijos (mensual + anual)")
  console.log("   • 8 conceptos de costos variables")
  console.log("   • 19 materiales (telas, hilos, botones, cierres, avíos)")
  console.log("   • 8 prendas base (plantillas)")
  console.log("   • 6 clientes (5 con medidas)")
  console.log("   • 5 prendas calculadas (3 a medida + 2 inventario)")
  console.log("   • 3 cotizaciones (en distintos estados)")
  console.log("   • 10 transacciones financieras")
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
