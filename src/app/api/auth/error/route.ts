import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const error = searchParams.get("error");

  logger.error("Authentication error", new Error(error || "Unknown error"), {
    error,
    url: req.url,
    ip: req.headers.get("x-forwarded-for"),
  });

  return NextResponse.json({ error }, { status: 401 });
}
