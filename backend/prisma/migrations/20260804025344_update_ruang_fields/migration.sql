/*
  Warnings:

  - You are about to drop the column `lokasi` on the `ruang` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[kodeRuang]` on the table `ruang` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `ruang` DROP COLUMN `lokasi`,
    ADD COLUMN `jenisRuang` VARCHAR(191) NULL,
    ADD COLUMN `kodeRuang` VARCHAR(191) NULL,
    ADD COLUMN `namaGedung` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ruang_kodeRuang_key` ON `ruang`(`kodeRuang`);
