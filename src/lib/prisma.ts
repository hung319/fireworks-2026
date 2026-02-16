import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  
  if (process.env.VERCEL) {
    const tmpDir = "/tmp";
    const tmpDbPath = path.join(tmpDir, "dev.db");
    
    const possiblePaths = [
      path.join(process.cwd(), "prisma", "dev.db"),
      path.join(__dirname || "", "..", "prisma", "dev.db"),
      path.join(process.env.LAMBDA_TASK_ROOT || "", "prisma", "dev.db"),
    ];
    
    let srcDbPath = "";
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        srcDbPath = p;
        break;
      }
    }
    
    if (!fs.existsSync(tmpDbPath) && srcDbPath && fs.existsSync(srcDbPath)) {
      fs.copyFileSync(srcDbPath, tmpDbPath);
    }
    
    return `file:${tmpDbPath}`;
  }
  
  return "file:./prisma/dev.db";
}

process.env.DATABASE_URL = getDatabaseUrl();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
