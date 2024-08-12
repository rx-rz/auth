/*
  Warnings:

  - A unique constraint covering the columns `[adminId]` on the table `Challenge` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Challenge_adminId_key" ON "Challenge"("adminId");
