/*
  Warnings:

  - Added the required column `storagePath` to the `Receipt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Receipt" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "originalFileName" TEXT,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "processingError" TEXT,
ADD COLUMN     "storagePath" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Receipt_ocrStatus_idx" ON "Receipt"("ocrStatus");

-- CreateIndex
CREATE INDEX "Receipt_uploadedAt_idx" ON "Receipt"("uploadedAt");

-- RenameIndex
ALTER INDEX "idx_receipts_project" RENAME TO "Receipt_projectId_idx";

-- RenameIndex
ALTER INDEX "idx_receipts_user" RENAME TO "Receipt_userId_idx";
