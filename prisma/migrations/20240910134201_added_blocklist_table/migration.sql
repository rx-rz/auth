-- CreateTable
CREATE TABLE "blocklist" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "username" TEXT,
    "project_id" TEXT NOT NULL,

    CONSTRAINT "blocklist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blocklist_id_key" ON "blocklist"("id");

-- CreateIndex
CREATE INDEX "login_username_idx" ON "login"("username");

-- CreateIndex
CREATE INDEX "login_email_idx" ON "login"("email");

-- AddForeignKey
ALTER TABLE "blocklist" ADD CONSTRAINT "blocklist_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocklist" ADD CONSTRAINT "blocklist_username_fkey" FOREIGN KEY ("username") REFERENCES "user_projects"("user_name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blocklist" ADD CONSTRAINT "blocklist_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
