-- CreateTable
CREATE TABLE "Firework" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "message" TEXT,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME
);

-- CreateIndex
CREATE INDEX "Firework_id_idx" ON "Firework"("id");
