/*
  Warnings:

  - You are about to drop the column `userProjectProjectId` on the `blocklist` table. All the data in the column will be lost.
  - You are about to drop the column `userProjectUserId` on the `blocklist` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "blocklist" DROP CONSTRAINT "blocklist_userProjectUserId_userProjectProjectId_fkey";

-- AlterTable
ALTER TABLE "blocklist" DROP COLUMN "userProjectProjectId",
DROP COLUMN "userProjectUserId";
