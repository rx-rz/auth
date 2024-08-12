/*
  Warnings:

  - You are about to drop the column `algorithm` on the `webauthn_credentials` table. All the data in the column will be lost.
  - You are about to drop the column `credentialId` on the `webauthn_credentials` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[adminId,webauthnUserId]` on the table `webauthn_credentials` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deviceType` to the `webauthn_credentials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `webauthnUserId` to the `webauthn_credentials` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "webauthn_credentials_credentialId_key";

-- AlterTable
ALTER TABLE "webauthn_credentials" DROP COLUMN "algorithm",
DROP COLUMN "credentialId",
ADD COLUMN     "backedUp" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "deviceType" VARCHAR(32) NOT NULL,
ADD COLUMN     "webauthnUserId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "webauthn_credentials_webauthnUserId_idx" ON "webauthn_credentials"("webauthnUserId");

-- CreateIndex
CREATE UNIQUE INDEX "webauthn_credentials_adminId_webauthnUserId_key" ON "webauthn_credentials"("adminId", "webauthnUserId");
