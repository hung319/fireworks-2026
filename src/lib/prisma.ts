// Ensure a fallback DATABASE_URL is provided so Prisma can initialize
// This allows using a local sqlite database even when environment vars are missing
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "sqlite:./prisma/dev.db";
}

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
