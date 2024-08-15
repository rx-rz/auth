/*
  Warnings:

  - You are about to drop the column `name` on the `oauth_providers` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[auth_method,project_id]` on the table `oauth_providers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "OAuthProviders" AS ENUM ('GOOGLE', 'GITHUB');

-- DropIndex
DROP INDEX "oauth_providers_name_key";

-- DropIndex
DROP INDEX "oauth_providers_name_project_id_key";

-- AlterTable
ALTER TABLE "oauth_providers" DROP COLUMN "name",
ADD COLUMN     "auth_method" "OAuthProviders" NOT NULL DEFAULT 'GOOGLE';

-- CreateIndex
CREATE UNIQUE INDEX "oauth_providers_auth_method_project_id_key" ON "oauth_providers"("auth_method", "project_id");
