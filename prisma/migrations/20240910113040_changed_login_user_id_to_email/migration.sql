/*
  Warnings:

  - You are about to drop the column `user_id` on the `login` table. All the data in the column will be lost.
  - Added the required column `user_email` to the `login` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "login" DROP CONSTRAINT "login_user_id_fkey";

-- AlterTable
ALTER TABLE "login" DROP COLUMN "user_id",
ADD COLUMN     "user_email" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "login" ADD CONSTRAINT "login_user_email_fkey" FOREIGN KEY ("user_email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;
