/*
  Warnings:

  - You are about to drop the column `user_email` on the `login` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "LoginIdentifierTypes" AS ENUM ('USERNAME');

-- DropForeignKey
ALTER TABLE "login" DROP CONSTRAINT "login_user_email_fkey";

-- AlterTable
ALTER TABLE "login" DROP COLUMN "user_email",
ADD COLUMN     "email" TEXT,
ADD COLUMN     "username" TEXT;

-- AddForeignKey
ALTER TABLE "login" ADD CONSTRAINT "login_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login" ADD CONSTRAINT "login_username_fkey" FOREIGN KEY ("username") REFERENCES "user_projects"("user_name") ON DELETE CASCADE ON UPDATE CASCADE;
