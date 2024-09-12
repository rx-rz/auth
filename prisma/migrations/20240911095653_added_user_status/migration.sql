-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCKED');

-- AlterTable
ALTER TABLE "user_projects" ADD COLUMN     "user_status" "UserStatus" NOT NULL DEFAULT 'ACTIVE';
