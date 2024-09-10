/*
  Warnings:

  - A unique constraint covering the columns `[user_name]` on the table `user_projects` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "project_settings" ALTER COLUMN "refresh_token_days" SET DEFAULT 7,
ALTER COLUMN "clear_logins_after_days" SET DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "user_projects_user_name_key" ON "user_projects"("user_name");
