/*
  Warnings:

  - You are about to drop the column `mfa_secret` on the `admins` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "admins" DROP COLUMN "mfa_secret",
ADD COLUMN     "mfaEnabled" BOOLEAN NOT NULL DEFAULT false;
