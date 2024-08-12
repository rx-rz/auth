-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "challenge" TEXT NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_id_key" ON "Challenge"("id");

-- CreateIndex
CREATE INDEX "Challenge_adminId_idx" ON "Challenge"("adminId");

-- AddForeignKey
ALTER TABLE "Challenge" ADD CONSTRAINT "Challenge_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "admins"("id") ON DELETE CASCADE ON UPDATE CASCADE;
