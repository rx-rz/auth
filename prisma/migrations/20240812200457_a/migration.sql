/*
  Warnings:

  - You are about to drop the column `adminId` on the `webauthn_credentials` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,webauthnUserId]` on the table `webauthn_credentials` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `webauthn_credentials` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "webauthn_credentials" DROP CONSTRAINT "webauthn_credentials_adminId_fkey";

-- DropIndex
DROP INDEX "webauthn_credentials_adminId_webauthnUserId_key";

-- AlterTable
ALTER TABLE "webauthn_credentials" DROP COLUMN "adminId",
ADD COLUMN     "userId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "webauthn_credentials_userId_webauthnUserId_key" ON "webauthn_credentials"("userId", "webauthnUserId");

-- AddForeignKey
ALTER TABLE "webauthn_credentials" ADD CONSTRAINT "webauthn_credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
