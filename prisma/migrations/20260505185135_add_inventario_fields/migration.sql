-- AlterTable
ALTER TABLE "prendas_calculadas" ADD COLUMN     "cantidad_inventario" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "cantidad_vendida" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stock_minimo" INTEGER NOT NULL DEFAULT 0;
