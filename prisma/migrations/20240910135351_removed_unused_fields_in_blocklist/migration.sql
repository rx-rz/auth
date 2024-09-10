/*
  Warnings:

  - You are about to drop the column `email` on the `blocklist` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `blocklist` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,project_id]` on the table `blocklist` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "blocklist" DROP CONSTRAINT "blocklist_email_fkey";

-- DropForeignKey
ALTER TABLE "blocklist" DROP CONSTRAINT "blocklist_username_fkey";

-- DropIndex
DROP INDEX "blocklist_email_project_id_key";

-- DropIndex
DROP INDEX "blocklist_username_project_id_key";

-- AlterTable
ALTER TABLE "blocklist" DROP COLUMN "email",
DROP COLUMN "username",
ADD COLUMN     "userProjectProjectId" TEXT,
ADD COLUMN     "userProjectUserId" TEXT,
ADD COLUMN     "user_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "blocklist_user_id_project_id_key" ON "blocklist"("user_id", "project_id");

-- AddForeignKey
ALTER TABLE "blocklist" ADD CONSTRAINT "blocklist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocklist" ADD CONSTRAINT "blocklist_userProjectUserId_userProjectProjectId_fkey" FOREIGN KEY ("userProjectUserId", "userProjectProjectId") REFERENCES "user_projects"("user_id", "project_id") ON DELETE SET NULL ON UPDATE CASCADE;
