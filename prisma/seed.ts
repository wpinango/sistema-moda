import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Iniciando seed de base de datos...')

  const password = await bcrypt.hash('admin123', 10)
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@moda.com' },
    update: {},
    create: {
      nombre: 'Diseñadora',
      email: 'admin@moda.com',
      password,
      rol: 'ADMIN'
    }
  })
  console.log('✅ Usuario admin creado')

  const configs = [
    { clave: 'costo_hora_mano_obra', valor: '15.00' },
    { clave: 'porcentaje_costos_indirectos', valor: '20' },
    { clave: 'margen_default', valor: '40' },
    { clave: 'descuento_docena_pct', valor: '15' },
    { clave: 'moneda', valor: 'USD' },
    { clave: 'nombre_taller', valor: 'Mi Taller de Moda' }
  ]

  for (const config of configs) {
    await prisma.configuracion.upsert({
      where: { clave: config.clave },
      update: config,
      create: config
    })
  }
  console.log('✅ Configuraciones creadas')

  const seda = await prisma.material.create({
    data: {
      nombre: 'Seda natural blanca',
      tipo: 'TELA',
      unidadMedida: 'METRO',
      stockActual: 50,
      stockMinimo: 5,
      costoUnitario: 15.50,
      proveedor: 'Telas Premium SA',
      color: 'Blanco'
    }
  })

  const hilo = await prisma.material.create({
    data: {
      nombre: 'Hilo poliéster blanco',
      tipo: 'HILO',
      unidadMedida: 'UNIDAD',
      stockActual: 20,
      stockMinimo: 3,
      costoUnitario: 2.50
    }
  })

  const botonNacar = await prisma.material.create({
    data: {
      nombre: 'Botón nácar 15mm',
      tipo: 'BOTON',
      unidadMedida: 'UNIDAD',
      stockActual: 200,
      stockMinimo: 50,
      costoUnitario: 0.80,
      color: 'Nácar'
    }
  })

  const cremallera = await prisma.material.create({
    data: {
      nombre: 'Cremallera invisible 20cm',
      tipo: 'CREMALLERA',
      unidadMedida: 'UNIDAD',
      stockActual: 30,
      stockMinimo: 5,
      costoUnitario: 1.50
    }
  })

  const algodon = await prisma.material.create({
    data: {
      nombre: 'Algodón orgánico',
      tipo: 'TELA',
      unidadMedida: 'METRO',
      stockActual: 30,
      stockMinimo: 5,
      costoUnitario: 8.00,
      proveedor: 'Telas Eco'
    }
  })

  console.log('✅ Materiales creados')

  const blusaSeda = await prisma.prendaBase.create({
    data: {
      nombre: 'Blusa manga larga seda',
      categoria: 'BLUSA',
      complejidad: 'MEDIA',
      tiempoEstimadoMin: 180,
      margenSugeridoPct: 40,
      descripcion: 'Blusa elegante en seda natural',
      materiales: {
        create: [
          { materialId: seda.id, cantidad: 1.5, esObligatorio: true },
          { materialId: hilo.id, cantidad: 1, esObligatorio: true },
          { materialId: botonNacar.id, cantidad: 6, esObligatorio: true }
        ]
      }
    }
  })

  const vestidoAlgodon = await prisma.prendaBase.create({
    data: {
      nombre: 'Vestido verano algodón',
      categoria: 'VESTIDO',
      complejidad: 'ALTA',
      tiempoEstimadoMin: 300,
      margenSugeridoPct: 45,
      descripcion: 'Vestido fresco en algodón orgánico',
      materiales: {
        create: [
          { materialId: algodon.id, cantidad: 3.0, esObligatorio: true },
          { materialId: hilo.id, cantidad: 2, esObligatorio: true },
          { materialId: cremallera.id, cantidad: 1, esObligatorio: true }
        ]
      }
    }
  })

  console.log('✅ Prendas base creadas')

  const cliente = await prisma.cliente.create({
    data: {
      nombre: 'María García',
      email: 'maria@email.com',
      telefono: '+1234567890',
      direccion: 'Calle Principal 123',
      notas: 'Cliente frecuente, prefiere colores claros',
      medidas: {
        create: {
          busto: 90,
          cintura: 70,
          cadera: 95,
          largoManga: 58,
          largoTotal: 150,
          notas: 'Medidas tomadas mayo 2024'
        }
      }
    }
  })

  console.log('✅ Cliente de ejemplo creado')

  // Configuración del sistema
  await prisma.configuracion.upsert({
    where: { clave: 'costo_mano_obra_hora' },
    update: {},
    create: { clave: 'costo_mano_obra_hora', valor: '15' }
  })

  await prisma.configuracion.upsert({
    where: { clave: 'porcentaje_costos_indirectos' },
    update: {},
    create: { clave: 'porcentaje_costos_indirectos', valor: '20' }
  })

  await prisma.configuracion.upsert({
    where: { clave: 'margen_ganancia_defecto' },
    update: {},
    create: { clave: 'margen_ganancia_defecto', valor: '40' }
  })

  await prisma.configuracion.upsert({
    where: { clave: 'descuento_docena' },
    update: {},
    create: { clave: 'descuento_docena', valor: '15' }
  })

  console.log('✅ Configuración del sistema creada')
  console.log('🎉 Seed completado exitosamente!')
  console.log('')
  console.log('📧 Datos de acceso:')
  console.log('   Email: admin@moda.com')
  console.log('   Password: admin123')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
