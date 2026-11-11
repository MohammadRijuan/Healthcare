/*
  Warnings:

  - You are about to drop the column `consultaionFee` on the `doctors` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "doctors" DROP COLUMN "consultaionFee",
ADD COLUMN     "consultationFee" DECIMAL(10,2);
