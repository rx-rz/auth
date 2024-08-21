/*
  Warnings:

  - You are about to drop the column `state` on the `OAuthState` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "OAuthState_state_key";

-- AlterTable
ALTER TABLE "OAuthState" DROP COLUMN "state";
