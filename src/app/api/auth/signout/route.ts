import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    logger.info("User signed out successfully", {
      callbackUrl,
      ip: request.headers.get("x-forwarded-for") || "unknown",
    });

    return NextResponse.json({ url: callbackUrl });
  } catch (error) {
    logger.error("Error during sign out", error as Error);
    return NextResponse.json({ error: "Failed to sign out" }, { status: 500 });
  }
}
