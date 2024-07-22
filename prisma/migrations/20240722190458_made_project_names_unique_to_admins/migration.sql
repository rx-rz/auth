/*
  Warnings:

  - A unique constraint covering the columns `[name,admin_id]` on the table `projects` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "projects_name_admin_id_key" ON "projects"("name", "admin_id");
