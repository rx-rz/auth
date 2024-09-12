/*
  Warnings:

  - Made the column `attempts` on table `login` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "login" ALTER COLUMN "attempts" SET NOT NULL,
ALTER COLUMN "attempts" SET DEFAULT 1;
