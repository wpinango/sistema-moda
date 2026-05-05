-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rol" TEXT NOT NULL DEFAULT 'ADMIN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clientes" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT,
    "telefono" TEXT,
    "direccion" TEXT,
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medidas" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "fecha_toma" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "busto" DECIMAL(5,2),
    "cintura" DECIMAL(5,2),
    "cadera" DECIMAL(5,2),
    "largo_manga" DECIMAL(5,2),
    "largo_total" DECIMAL(5,2),
    "personalizadas" JSONB,
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medidas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materiales" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "unidad_medida" TEXT NOT NULL,
    "color" TEXT,
    "stock_actual" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "stock_minimo" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "costo_unitario" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "proveedor" TEXT,
    "notas" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materiales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prendas_base" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "complejidad" TEXT NOT NULL DEFAULT 'MEDIA',
    "tiempo_estimado_min" INTEGER NOT NULL DEFAULT 60,
    "margen_sugerido_pct" DECIMAL(5,2) NOT NULL DEFAULT 40,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "descripcion" TEXT,
    "instrucciones" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prendas_base_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prendas_base_materiales" (
    "id" TEXT NOT NULL,
    "prenda_base_id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "cantidad" DECIMAL(10,3) NOT NULL,
    "es_obligatorio" BOOLEAN NOT NULL DEFAULT true,
    "notas" TEXT,

    CONSTRAINT "prendas_base_materiales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prendas_calculadas" (
    "id" TEXT NOT NULL,
    "prenda_base_id" TEXT,
    "cliente_id" TEXT,
    "nombre" TEXT NOT NULL,
    "fecha_calculo" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "costo_materiales" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "costo_mano_obra" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "costos_indirectos" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "costo_total_unitario" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "precio_venta_unitario" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "precio_venta_docena" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "margen_aplicado_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "talla" TEXT,
    "es_para_inventario" BOOLEAN NOT NULL DEFAULT false,
    "tiempo_real_min" INTEGER,
    "notas_tecnicas" TEXT,
    "es_referencia" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prendas_calculadas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prendas_calculadas_materiales" (
    "id" TEXT NOT NULL,
    "prenda_calculada_id" TEXT NOT NULL,
    "material_id" TEXT NOT NULL,
    "cantidad_usada" DECIMAL(10,3) NOT NULL,
    "costo_unitario_momento" DECIMAL(10,2) NOT NULL,
    "costo_total" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "prendas_calculadas_materiales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cotizaciones" (
    "id" TEXT NOT NULL,
    "cliente_id" TEXT NOT NULL,
    "prenda_calculada_id" TEXT,
    "numero" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'COTIZADO',
    "fecha_entrega" TIMESTAMP(3),
    "subtotal" DECIMAL(10,2) NOT NULL,
    "descuento" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(10,2) NOT NULL,
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cotizaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transacciones" (
    "id" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "concepto" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoria" TEXT,
    "referencia" TEXT,
    "notas" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transacciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracion" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,

    CONSTRAINT "configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "prendas_base_materiales_prenda_base_id_material_id_key" ON "prendas_base_materiales"("prenda_base_id", "material_id");

-- CreateIndex
CREATE UNIQUE INDEX "cotizaciones_numero_key" ON "cotizaciones"("numero");

-- CreateIndex
CREATE UNIQUE INDEX "configuracion_clave_key" ON "configuracion"("clave");

-- AddForeignKey
ALTER TABLE "medidas" ADD CONSTRAINT "medidas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prendas_base_materiales" ADD CONSTRAINT "prendas_base_materiales_prenda_base_id_fkey" FOREIGN KEY ("prenda_base_id") REFERENCES "prendas_base"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prendas_base_materiales" ADD CONSTRAINT "prendas_base_materiales_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materiales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prendas_calculadas" ADD CONSTRAINT "prendas_calculadas_prenda_base_id_fkey" FOREIGN KEY ("prenda_base_id") REFERENCES "prendas_base"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prendas_calculadas" ADD CONSTRAINT "prendas_calculadas_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prendas_calculadas_materiales" ADD CONSTRAINT "prendas_calculadas_materiales_prenda_calculada_id_fkey" FOREIGN KEY ("prenda_calculada_id") REFERENCES "prendas_calculadas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prendas_calculadas_materiales" ADD CONSTRAINT "prendas_calculadas_materiales_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materiales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_cliente_id_fkey" FOREIGN KEY ("cliente_id") REFERENCES "clientes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cotizaciones" ADD CONSTRAINT "cotizaciones_prenda_calculada_id_fkey" FOREIGN KEY ("prenda_calculada_id") REFERENCES "prendas_calculadas"("id") ON DELETE SET NULL ON UPDATE CASCADE;
