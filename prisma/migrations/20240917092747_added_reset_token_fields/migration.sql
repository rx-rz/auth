-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "reset_token" TEXT,
ADD COLUMN     "reset_token_expiration" TIMESTAMP(3);
