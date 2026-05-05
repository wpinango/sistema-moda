-- CreateTable
CREATE TABLE "imagenes_prendas" (
    "id" TEXT NOT NULL,
    "prenda_calculada_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "nombre" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "es_principal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "imagenes_prendas_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "imagenes_prendas" ADD CONSTRAINT "imagenes_prendas_prenda_calculada_id_fkey" FOREIGN KEY ("prenda_calculada_id") REFERENCES "prendas_calculadas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
