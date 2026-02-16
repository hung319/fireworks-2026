import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, image } = body;

    // Calculate expiration (7 days from now)
    const expiresAt = new Date();
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
    return NextResponse.json(
      { error: "Failed to create firework" },
      { status: 500 }
    );
  }
}
