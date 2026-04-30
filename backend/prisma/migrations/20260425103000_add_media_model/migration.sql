-- CreateEnum
CREATE TYPE "MediaEntityType" AS ENUM ('AVATAR', 'POST', 'CHAT_ATTACHMENT', 'ESTABLISHMENT', 'EVENT', 'PRODUCT');

-- CreateEnum
CREATE TYPE "MediaProvider" AS ENUM ('S3', 'LOCAL');

-- CreateTable
CREATE TABLE "Media" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "entityType" "MediaEntityType" NOT NULL,
    "entityId" TEXT,
    "provider" "MediaProvider" NOT NULL,
    "bucket" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "publicUrl" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Media_ownerId_idx" ON "Media"("ownerId");

-- CreateIndex
CREATE INDEX "Media_entityType_entityId_idx" ON "Media"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "Media_createdAt_idx" ON "Media"("createdAt");

-- AddForeignKey
ALTER TABLE "Media" ADD CONSTRAINT "Media_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
