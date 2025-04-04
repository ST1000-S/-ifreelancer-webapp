import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Logger } from "@/lib/logger";

const logger = Logger;

export async function POST(req: Request) {
  try {
    // Log the raw request
    logger.debug("Raw request headers", {
      headers: Object.fromEntries(req.headers.entries()),
    });

    const body = await req.json();
    logger.debug("Raw request body", { body });

    const { email, password, name, role } = body;
    logger.debug("Parsed fields", { email, name, role });

    // Validate input
    if (!email || !password || !name || !role) {
      const missingFields = [];
      if (!email) missingFields.push("email");
      if (!password) missingFields.push("password");
      if (!name) missingFields.push("name");
      if (!role) missingFields.push("role");

      logger.warn("Missing required fields in signup", {
        missingFields: missingFields.join(", "),
        receivedFields: Object.keys(body).join(", "),
        ip: req.headers.get("x-forwarded-for") || "unknown",
      });
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Check if user already exists
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        logger.warn("Signup attempt with existing email", {
          email,
          ip: req.headers.get("x-forwarded-for") || "unknown",
        });
        return NextResponse.json(
          { error: "User already exists" },
          { status: 400 }
        );
      }
    } catch (dbError) {
      logger.error("Database error checking existing user", dbError as Error, {
        email,
        error: (dbError as Error).message,
      });
      throw dbError;
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    try {
      logger.debug("Creating user", { email, name, role });
      const user = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: role as "FREELANCER" | "CLIENT",
        },
      });

      // Create empty profile
      logger.debug("Creating profile", { userId: user.id });
      await prisma.profile.create({
        data: {
          userId: user.id,
          title: "",
          bio: "",
        },
      });

      logger.info("New user created successfully", {
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return NextResponse.json({ message: "User created successfully" });
    } catch (dbError) {
      logger.error("Database error creating user", dbError as Error, {
        email,
        name,
        role,
        error: (dbError as Error).message,
      });
      throw dbError;
    }
  } catch (error) {
    const err = error as Error;
    logger.error("Error during signup", err, {
      name: err.name,
      message: err.message,
      stack: err.stack,
    });
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
