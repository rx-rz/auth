/*
  Warnings:

  - Added the required column `algorithm` to the `webauthn_credentials` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "webauthn_credentials" ADD COLUMN     "algorithm" TEXT NOT NULL,
ADD COLUMN     "transports" TEXT[],
ALTER COLUMN "counter" DROP NOT NULL;
