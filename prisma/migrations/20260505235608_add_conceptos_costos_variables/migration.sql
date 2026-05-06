-- CreateTable
CREATE TABLE "conceptos_costos_variables" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "monto_defecto" DECIMAL(10,2),
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conceptos_costos_variables_pkey" PRIMARY KEY ("id")
);
