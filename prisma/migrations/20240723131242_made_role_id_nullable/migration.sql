-- DropForeignKey
ALTER TABLE "user_projects" DROP CONSTRAINT "user_projects_role_id_fkey";

-- AlterTable
ALTER TABLE "user_projects" ALTER COLUMN "role_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "user_projects" ADD CONSTRAINT "user_projects_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
