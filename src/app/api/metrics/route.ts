import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { handleAPIError } from "@/lib/api-error";

export async function POST(request: Request) {
  try {
    const headersList = headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    const { metrics } = await request.json();

    // Store metrics in database
    await prisma.performanceMetric.create({
      data: {
        metrics: JSON.stringify(metrics),
        ip,
        userAgent,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAPIError(error);
  }
}
