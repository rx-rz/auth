/*
  Warnings:

  - You are about to drop the `OAuthState` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "OAuthState";

-- CreateTable
CREATE TABLE "oauth_state" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "providerName" "OAuthProviders" NOT NULL,

    CONSTRAINT "oauth_state_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "oauth_state_id_key" ON "oauth_state"("id");
