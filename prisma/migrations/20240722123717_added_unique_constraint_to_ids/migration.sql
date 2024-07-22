/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `admin_notifications` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `admins` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `magic_links` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `oauth_providers` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `otps` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `permissions` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `projects` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `refresh_tokens` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `roles` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `user_oauth_accounts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `webauthn_credentials` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "admin_notifications_id_key" ON "admin_notifications"("id");

-- CreateIndex
CREATE UNIQUE INDEX "admins_id_key" ON "admins"("id");

-- CreateIndex
CREATE UNIQUE INDEX "magic_links_id_key" ON "magic_links"("id");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_providers_id_key" ON "oauth_providers"("id");

-- CreateIndex
CREATE UNIQUE INDEX "otps_id_key" ON "otps"("id");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_id_key" ON "permissions"("id");

-- CreateIndex
CREATE UNIQUE INDEX "projects_id_key" ON "projects"("id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_id_key" ON "refresh_tokens"("id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_id_key" ON "roles"("id");

-- CreateIndex
CREATE UNIQUE INDEX "user_oauth_accounts_id_key" ON "user_oauth_accounts"("id");

-- CreateIndex
CREATE UNIQUE INDEX "users_id_key" ON "users"("id");

-- CreateIndex
CREATE UNIQUE INDEX "webauthn_credentials_id_key" ON "webauthn_credentials"("id");
