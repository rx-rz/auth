-- AlterTable
ALTER TABLE "permissions" ADD COLUMN     "projectId" TEXT;

-- AddForeignKey
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
