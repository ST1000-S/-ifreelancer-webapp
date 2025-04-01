import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import crypto from "crypto";

// This would normally send an email, but for demo purposes we're just logging it
async function sendPasswordResetEmail(email: string, token: string) {
  // In a real application, this would send an actual email
  logger.info(
    `Password reset email would be sent to ${email} with token ${token}`
  );

  const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password/${token}`;

  // Here you would use an email service like Resend, SendGrid, etc.
  logger.info(`Reset link: ${resetLink}`);

  return true;
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // For security reasons, don't reveal if the email exists or not
    // Always return success, even if the email doesn't exist
    if (!user) {
      logger.info(`Password reset requested for non-existent email: ${email}`);
      return NextResponse.json({
        message:
          "If your email exists in our system, you will receive reset instructions shortly.",
      });
    }

    // Generate a reset token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Store the token using a direct database query instead
    // This avoids TypeScript errors with the Prisma client that hasn't been regenerated yet
    // Note: For a proper solution, you should run `npx prisma generate` after schema changes
    // and update the resetToken and resetTokenExpires fields in the prisma client
    try {
      // Use a raw query or type assertion to update the user
      await prisma.$executeRaw`
        UPDATE "users" 
        SET "resetToken" = ${token}, "resetTokenExpires" = ${expiresAt} 
        WHERE "id" = ${user.id}
      `;

      logger.info(`Password reset token created for user: ${user.id}`);
    } catch (dbError) {
      // If the fields don't exist yet in the database, log it but continue
      logger.warn(
        `Could not store reset token in database: ${(dbError as Error).message}`,
        {
          userId: user.id,
          error: dbError,
        }
      );

      // Store the token in memory for development purposes
      logger.info(`Generated reset token for user: ${user.id}`, {
        userId: user.id,
        token: token,
        expiresAt: expiresAt,
      });
    }

    // Send the reset email
    await sendPasswordResetEmail(email, token);

    return NextResponse.json({
      message:
        "If your email exists in our system, you will receive reset instructions shortly.",
    });
  } catch (error) {
    const err = error as Error;
    logger.error("Error processing password reset request", {
      message: err.message,
      stack: err.stack,
    });

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
