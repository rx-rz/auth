/*
  Warnings:

  - You are about to drop the `AdminRefreshToken` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `redirect_uri` to the `oauth_providers` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AdminRefreshToken" DROP CONSTRAINT "AdminRefreshToken_admin_id_fkey";

-- AlterTable
ALTER TABLE "oauth_providers" ADD COLUMN     "redirect_uri" TEXT NOT NULL;

-- DropTable
DROP TABLE "AdminRefreshToken";

-- CreateTable
CREATE TABLE "admin_refresh_tokens" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_refresh_tokens_id_key" ON "admin_refresh_tokens"("id");

-- CreateIndex
CREATE UNIQUE INDEX "admin_refresh_tokens_token_key" ON "admin_refresh_tokens"("token");

-- AddForeignKey
ALTER TABLE "admin_refresh_tokens" ADD CONSTRAINT "admin_refresh_tokens_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
