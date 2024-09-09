/*
  Warnings:

  - The `prevent_previous_passwords` column on the `project_settings` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "project_settings" DROP COLUMN "prevent_previous_passwords",
ADD COLUMN     "prevent_previous_passwords" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "user_projects" ADD COLUMN     "user_name" VARCHAR(255),
ALTER COLUMN "first_name" DROP NOT NULL,
ALTER COLUMN "last_name" DROP NOT NULL;
