import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

// Define a type for the user record returned from the raw query
type UserWithResetToken = {
  id: string;
  email: string;
  resetToken: string | null;
  resetTokenExpires: Date | null;
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { valid: false, message: "Token is required" },
        { status: 400 }
      );
    }

    // Check for the token in the database
    try {
      // Use a raw query since the Prisma client might not be regenerated yet
      const result = await prisma.$queryRaw`
        SELECT * FROM "users" 
        WHERE "resetToken" = ${token} 
        AND "resetTokenExpires" > NOW()
      `;

      const users = result as UserWithResetToken[];

      if (users && users.length > 0) {
        return NextResponse.json({ valid: true });
      } else {
        return NextResponse.json(
          { valid: false, message: "Invalid or expired token" },
          { status: 400 }
        );
      }
    } catch (dbError) {
      logger.warn(`Error querying reset token: ${(dbError as Error).message}`, {
        error: dbError,
      });

      // In development, we'll use a mock for testing
      if (
        process.env.NODE_ENV === "development" &&
        token === "mock-valid-token"
      ) {
        return NextResponse.json({ valid: true });
      }

      return NextResponse.json(
        { valid: false, message: "Invalid or expired token" },
        { status: 400 }
      );
    }
  } catch (error) {
    logger.error("Error verifying reset token", error as Error);
    return NextResponse.json(
      { valid: false, message: "An error occurred" },
      { status: 500 }
    );
  }
}
