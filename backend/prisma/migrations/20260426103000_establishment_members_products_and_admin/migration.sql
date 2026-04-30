-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK');

-- AlterTable
ALTER TABLE "Establishment"
ADD COLUMN IF NOT EXISTS "subcategory" TEXT,
ADD COLUMN IF NOT EXISTS "whatsapp" TEXT,
ADD COLUMN IF NOT EXISTS "openingHours" JSONB,
ADD COLUMN IF NOT EXISTS "logoUrl" TEXT,
ADD COLUMN IF NOT EXISTS "coverImageUrl" TEXT;

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "price" DOUBLE PRECISION,
    "status" "ProductStatus" NOT NULL DEFAULT 'ACTIVE',
    "mainImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Product_establishmentId_status_idx" ON "Product"("establishmentId", "status");

-- CreateIndex
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "Establishment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
