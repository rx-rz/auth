/*
  Warnings:

  - You are about to drop the column `isRead` on the `admin_notifications` table. All the data in the column will be lost.
  - You are about to drop the column `apiKey` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `clientKey` on the `projects` table. All the data in the column will be lost.
  - You are about to drop the column `authMethod` on the `refresh_tokens` table. All the data in the column will be lost.
  - The primary key for the `role_permissions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `permissionId` on the `role_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `roleId` on the `role_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `backedUp` on the `webauthn_credentials` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `webauthn_credentials` table. All the data in the column will be lost.
  - You are about to drop the column `deviceType` on the `webauthn_credentials` table. All the data in the column will be lost.
  - You are about to drop the column `lastUsedAt` on the `webauthn_credentials` table. All the data in the column will be lost.
  - You are about to drop the column `publicKey` on the `webauthn_credentials` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `webauthn_credentials` table. All the data in the column will be lost.
  - You are about to drop the column `webauthnUserId` on the `webauthn_credentials` table. All the data in the column will be lost.
  - You are about to drop the `Challenge` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[client_id]` on the table `oauth_providers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[client_secret]` on the table `oauth_providers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,project_id]` on the table `oauth_providers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[api_key]` on the table `projects` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[client_key]` on the table `projects` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[user_id,webauthn_userid]` on the table `webauthn_credentials` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `client_id` to the `oauth_providers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `client_secret` to the `oauth_providers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project_id` to the `oauth_providers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `api_key` to the `projects` table without a default value. This is not possible if the table is not empty.
  - The required column `client_key` was added to the `projects` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `permission_id` to the `role_permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role_id` to the `role_permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `project_id` to the `user_oauth_accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `device_type` to the `webauthn_credentials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_used_at` to the `webauthn_credentials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `public_key` to the `webauthn_credentials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `webauthn_credentials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `webauthn_userid` to the `webauthn_credentials` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Challenge" DROP CONSTRAINT "Challenge_adminId_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_permissionId_fkey";

-- DropForeignKey
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_roleId_fkey";

-- DropForeignKey
ALTER TABLE "webauthn_credentials" DROP CONSTRAINT "webauthn_credentials_userId_fkey";

-- DropIndex
DROP INDEX "projects_apiKey_key";

-- DropIndex
DROP INDEX "projects_clientKey_key";

-- DropIndex
DROP INDEX "webauthn_credentials_userId_webauthnUserId_key";

-- DropIndex
DROP INDEX "webauthn_credentials_webauthnUserId_idx";

-- AlterTable
ALTER TABLE "admin_notifications" DROP COLUMN "isRead",
ADD COLUMN     "is_read" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "oauth_providers" ADD COLUMN     "client_id" TEXT NOT NULL,
ADD COLUMN     "client_secret" TEXT NOT NULL,
ADD COLUMN     "project_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "projects" DROP COLUMN "apiKey",
DROP COLUMN "clientKey",
ADD COLUMN     "api_key" VARCHAR(64) NOT NULL,
ADD COLUMN     "client_key" VARCHAR(64) NOT NULL;

-- AlterTable
ALTER TABLE "refresh_tokens" DROP COLUMN "authMethod",
ADD COLUMN     "auth_method" "AuthMethod" NOT NULL DEFAULT 'EMAIL_AND_PASSWORD_SIGNIN';

-- AlterTable
ALTER TABLE "role_permissions" DROP CONSTRAINT "role_permissions_pkey",
DROP COLUMN "permissionId",
DROP COLUMN "roleId",
ADD COLUMN     "permission_id" TEXT NOT NULL,
ADD COLUMN     "role_id" TEXT NOT NULL,
ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("role_id", "permission_id");

-- AlterTable
ALTER TABLE "user_oauth_accounts" ADD COLUMN     "project_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "webauthn_credentials" DROP COLUMN "backedUp",
DROP COLUMN "createdAt",
DROP COLUMN "deviceType",
DROP COLUMN "lastUsedAt",
DROP COLUMN "publicKey",
DROP COLUMN "userId",
DROP COLUMN "webauthnUserId",
ADD COLUMN     "backed_up" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "device_type" VARCHAR(32) NOT NULL,
ADD COLUMN     "last_used_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "public_key" BYTEA NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL,
ADD COLUMN     "webauthn_userid" TEXT NOT NULL;

-- DropTable
DROP TABLE "Challenge";

-- CreateTable
CREATE TABLE "challenges" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "challenge" TEXT NOT NULL,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "challenges_id_key" ON "challenges"("id");

-- CreateIndex
CREATE UNIQUE INDEX "challenges_admin_id_key" ON "challenges"("admin_id");

-- CreateIndex
CREATE INDEX "challenges_admin_id_idx" ON "challenges"("admin_id");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_providers_client_id_key" ON "oauth_providers"("client_id");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_providers_client_secret_key" ON "oauth_providers"("client_secret");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_providers_name_project_id_key" ON "oauth_providers"("name", "project_id");

-- CreateIndex
CREATE UNIQUE INDEX "projects_api_key_key" ON "projects"("api_key");

-- CreateIndex
CREATE UNIQUE INDEX "projects_client_key_key" ON "projects"("client_key");

-- CreateIndex
CREATE INDEX "webauthn_credentials_webauthn_userid_idx" ON "webauthn_credentials"("webauthn_userid");

-- CreateIndex
CREATE UNIQUE INDEX "webauthn_credentials_user_id_webauthn_userid_key" ON "webauthn_credentials"("user_id", "webauthn_userid");

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_providers" ADD CONSTRAINT "oauth_providers_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_oauth_accounts" ADD CONSTRAINT "user_oauth_accounts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webauthn_credentials" ADD CONSTRAINT "webauthn_credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
