/*
  Warnings:

  - A unique constraint covering the columns `[email,project_id]` on the table `blocklist` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username,project_id]` on the table `blocklist` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "blocklist_email_project_id_key" ON "blocklist"("email", "project_id");

-- CreateIndex
CREATE UNIQUE INDEX "blocklist_username_project_id_key" ON "blocklist"("username", "project_id");
