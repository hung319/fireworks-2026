import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { execSync } from "child_process";

export async function POST(request: NextRequest) {
  // Prepare for possible retry after automatic migrations
  let bodyObj: { message?: string; image?: string } | null = null;
  let expiresAt: Date | undefined;
  try {
    bodyObj = await request.json();
    const message = bodyObj?.message;
    const image = bodyObj?.image;

    // Calculate expiration (7 days from now)
    expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const firework = await prisma.firework.create({
      data: {
        message: message || null,
        image: image || null,
        expiresAt,
      },
    });

    return NextResponse.json({ id: firework.id });
  } catch (error) {
    console.error("Error creating firework:", error);
    const err = error as any;
    const errorMsg = String(err?.message ?? error ?? "");
    const needsMigrationRetry = err?.code === "P2021" || /The table/.test(errorMsg) || /Unable to open the database file/.test(errorMsg);
    if (needsMigrationRetry && bodyObj) {
      try {
        execSync("npx prisma migrate deploy", { stdio: "inherit" });
      } catch (e) {
        console.error("Migration deploy failed during firework create retry:", e);
      }
      try {
        const payload: any = bodyObj ?? {};
        const message = payload?.message;
        const image = payload?.image;
        const fireworkRetry = await prisma.firework.create({
          data: {
            message: message ?? null,
            image: image ?? null,
            expiresAt: (expiresAt as Date) ?? new Date(),
          },
        });
        return NextResponse.json({ id: fireworkRetry.id });
      } catch (e2) {
        console.error("Retry after migration failed:", e2);
      }
    }
    return NextResponse.json(
      { error: "Failed to create firework" },
      { status: 500 }
    );
  }
}
