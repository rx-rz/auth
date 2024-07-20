/*
  Warnings:

  - You are about to drop the column `admin_id` on the `otps` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `otps` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `otps` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `otps` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "otps" DROP CONSTRAINT "otps_admin_id_fkey";

-- DropForeignKey
ALTER TABLE "otps" DROP CONSTRAINT "otps_user_id_fkey";

-- AlterTable
ALTER TABLE "otps" DROP COLUMN "admin_id",
DROP COLUMN "user_id",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "otps_email_key" ON "otps"("email");
