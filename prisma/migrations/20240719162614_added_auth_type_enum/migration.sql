/*
  Warnings:

  - You are about to drop the column `userId` on the `otps` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AuthMethod" AS ENUM ('GOOGLE_OAUTH', 'GITHUB_OAUTH', 'FACEBOOK_OAUTH', 'EMAIL_AND_PASSWORD_SIGNIN', 'MAGICLINK');

-- AlterTable
ALTER TABLE "access_tokens" ADD COLUMN     "authType" "AuthMethod" NOT NULL DEFAULT 'EMAIL_AND_PASSWORD_SIGNIN';

-- AlterTable
ALTER TABLE "otps" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "authType" "AuthMethod" NOT NULL DEFAULT 'EMAIL_AND_PASSWORD_SIGNIN';
