CREATE TABLE IF NOT EXISTS "Firework" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "message" TEXT,
  "image" TEXT,
  "createdAt" TEXT NOT NULL DEFAULT (datetime('now')),
  "expiresAt" TEXT
);
