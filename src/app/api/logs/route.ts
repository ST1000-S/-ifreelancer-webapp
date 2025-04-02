import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const headersList = headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    const { logs } = await request.json();

    // Store logs in database
    await prisma.systemLog.create({
      data: {
        logs: JSON.stringify(logs),
        ip,
        userAgent,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to store logs:", error);
    return NextResponse.json(
      { error: "Failed to store logs" },
      { status: 500 }
    );
  }
}
