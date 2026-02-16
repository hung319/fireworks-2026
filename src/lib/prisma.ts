// Ensure a fallback DATABASE_URL is provided so Prisma can initialize
// This allows using a local sqlite database even when environment vars are missing
// Prefer a writable tmp path (serverless-friendly). If tmp isn't writable, fall back to repo path.
import fs from "fs";
import * as path from "path";

let dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  try {
    // Ensure /tmp/prisma is writable
    const tmpDir = "/tmp/prisma";
    fs.mkdirSync(tmpDir, { recursive: true });
    // Use file protocol pointing to a temp sqlite database there
    dbUrl = "file:/tmp/prisma/dev.db";
  } catch (e) {
    // Fallback to repository path if /tmp isn't writable
    dbUrl = "file:./prisma/dev.db";
  }
  process.env.DATABASE_URL = dbUrl;
}

import { PrismaClient } from "@prisma/client";
import { execSync } from "child_process";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let _prismaInstance: PrismaClient | undefined;
export const prisma = globalForPrisma.prisma ?? (() => {
  // Initialize Prisma client and ensure DB schema exists (migration) if needed
  if (!_prismaInstance) {
    _prismaInstance = new PrismaClient();
  }
  return _prismaInstance!;
})();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Ensure database schema exists (simple migration guard) - run once per instance
let migrationsGuarded = false;
async function ensureDbSchema() {
  if (migrationsGuarded) return;
  migrationsGuarded = true;
  try {
    // Attempt a lightweight query to check if Firework table exists
    // This uses Prisma client to avoid needing a separate sqlite driver here
    await (prisma as any).$queryRaw`SELECT name FROM sqlite_master WHERE type='table' AND name='Firework';`;
  } catch {
    // If the table doesn't exist or the query fails, attempt to apply migrations
    try {
      // Run Prisma migrate deploy with the existing DATABASE_URL
      const env = Object.assign({}, process.env, { DATABASE_URL: process.env.DATABASE_URL });
      execSync("npx prisma migrate deploy", { stdio: 'inherit', env, cwd: process.cwd() });
    } catch (e) {
      // Silently swallow migration errors here to avoid blocking startup in some environments
      console.error("[prisma] Migration deploy failed during startup:", e?.toString?.() ?? e);
    }
  }
}

// Kick off on module load to ensure schema is ready for first requests
ensureDbSchema().catch(() => {
  // Ignore errors here; actual requests will surface issues if any
});
