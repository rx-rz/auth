/*
  Warnings:

  - You are about to drop the column `authType` on the `refresh_tokens` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "refresh_tokens" DROP COLUMN "authType",
ADD COLUMN     "authMethod" "AuthMethod" NOT NULL DEFAULT 'EMAIL_AND_PASSWORD_SIGNIN';
