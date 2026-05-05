-- CreateTable
CREATE TABLE "costos_fijos" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "periodicidad" TEXT NOT NULL DEFAULT 'MENSUAL',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "costos_fijos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "costos_variables" (
    "id" TEXT NOT NULL,
    "prenda_calculada_id" TEXT NOT NULL,
    "concepto" TEXT NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "descripcion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "costos_variables_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "costos_variables" ADD CONSTRAINT "costos_variables_prenda_calculada_id_fkey" FOREIGN KEY ("prenda_calculada_id") REFERENCES "prendas_calculadas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
