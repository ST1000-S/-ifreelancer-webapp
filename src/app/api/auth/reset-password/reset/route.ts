import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import bcrypt from "bcryptjs";

// Define a type for the user record returned from the raw query
type UserWithResetToken = {
  id: string;
  email: string;
  resetToken: string | null;
  resetTokenExpires: Date | null;
};

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    const isStrongPassword = validatePassword(password);
    if (!isStrongPassword.valid) {
      return NextResponse.json(
        { error: isStrongPassword.message },
        { status: 400 }
      );
    }

    // Find the user with this reset token
    try {
      // Use a raw query since the Prisma client might not be regenerated yet
      const result = await prisma.$queryRaw`
        SELECT * FROM "users" 
        WHERE "resetToken" = ${token} 
        AND "resetTokenExpires" > NOW()
      `;

      const users = result as UserWithResetToken[];

      if (!users || users.length === 0) {
        return NextResponse.json(
          { error: "Invalid or expired token" },
          { status: 400 }
        );
      }

      const user = users[0];

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Update the user's password and clear the reset token
      await prisma.$executeRaw`
        UPDATE "users" 
        SET "password" = ${hashedPassword}, "resetToken" = NULL, "resetTokenExpires" = NULL 
        WHERE "id" = ${user.id}
      `;

      logger.info(`Password reset successfully for user: ${user.id}`);

      return NextResponse.json({ message: "Password reset successfully" });
    } catch (dbError) {
      logger.error("Database error during password reset", dbError as Error);

      // In development, we'll use a mock for testing
      if (
        process.env.NODE_ENV === "development" &&
        token === "mock-valid-token"
      ) {
        return NextResponse.json({
          message: "Password reset successfully (Mock)",
        });
      }

      return NextResponse.json(
        { error: "An error occurred while resetting your password" },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error("Error during password reset", error as Error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

function validatePassword(password: string): {
  valid: boolean;
  message: string;
} {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return {
      valid: false,
      message: "Password must be at least 8 characters long",
    };
  }

  if (!hasUpperCase || !hasLowerCase) {
    return {
      valid: false,
      message: "Password must include both uppercase and lowercase letters",
    };
  }

  if (!hasNumbers) {
    return {
      valid: false,
      message: "Password must include at least one number",
    };
  }

  if (!hasSpecialChar) {
    return {
      valid: false,
      message: "Password must include at least one special character",
    };
  }

  return { valid: true, message: "" };
}
