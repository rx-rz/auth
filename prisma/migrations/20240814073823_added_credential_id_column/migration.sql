/*
  Warnings:

  - A unique constraint covering the columns `[credentialId]` on the table `webauthn_credentials` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `credentialId` to the `webauthn_credentials` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "webauthn_credentials" ADD COLUMN     "credentialId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "webauthn_credentials_credentialId_key" ON "webauthn_credentials"("credentialId");
