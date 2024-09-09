/*
  Warnings:

  - You are about to drop the `ProjectSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProjectSettings" DROP CONSTRAINT "ProjectSettings_project_id_fkey";

-- DropTable
DROP TABLE "ProjectSettings";

-- CreateTable
CREATE TABLE "project_settings" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "refresh_token_days" INTEGER NOT NULL DEFAULT 30,
    "password_min_length" INTEGER NOT NULL DEFAULT 8,
    "password_require_uppercase" BOOLEAN NOT NULL DEFAULT true,
    "password_require_lowercase" BOOLEAN NOT NULL DEFAULT true,
    "password_require_numbers" BOOLEAN NOT NULL DEFAULT true,
    "password_require_special_chars" BOOLEAN NOT NULL DEFAULT true,
    "clear_logins_after_days" INTEGER,
    "allow_multiple_credentials" BOOLEAN NOT NULL DEFAULT false,
    "allow_username" BOOLEAN NOT NULL DEFAULT false,
    "prevent_previous_passwords" INTEGER NOT NULL DEFAULT 3,
    "allow_passkey_verification" BOOLEAN NOT NULL DEFAULT false,
    "max_login_attempts" INTEGER NOT NULL DEFAULT 5,
    "lockout_duration_minutes" INTEGER NOT NULL DEFAULT 30,

    CONSTRAINT "project_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_settings_id_key" ON "project_settings"("id");

-- CreateIndex
CREATE UNIQUE INDEX "project_settings_project_id_key" ON "project_settings"("project_id");

-- AddForeignKey
ALTER TABLE "project_settings" ADD CONSTRAINT "project_settings_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
