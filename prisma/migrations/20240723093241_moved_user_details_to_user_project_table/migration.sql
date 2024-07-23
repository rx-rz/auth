/*
  Warnings:

  - You are about to drop the column `first_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - Added the required column `first_name` to the `user_projects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `user_projects` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_projects" ADD COLUMN     "first_name" VARCHAR(255) NOT NULL,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "last_name" VARCHAR(255) NOT NULL,
ADD COLUMN     "password" VARCHAR(255);

-- AlterTable
ALTER TABLE "users" DROP COLUMN "first_name",
DROP COLUMN "isVerified",
DROP COLUMN "last_name",
DROP COLUMN "password";
