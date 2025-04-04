import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const { email, password, name, role } = await req.json();
    console.log("Received signup request:", { email, name, role });

    // Validate input
    if (!email || !password || !name || !role) {
      console.log("Missing required fields:", { email, name, role });
      logger.warn("Missing required fields in signup", {
        missingFields: ["email", "password", "name", "role"].filter(
          (field) => !eval(field)
        ),
        ip: req.headers.get("x-forwarded-for"),
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("User already exists:", email);
      logger.warn("Signup attempt with existing email", {
        email,
        ip: req.headers.get("x-forwarded-for"),
      });
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    console.log("Creating user:", { email, name, role });
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role as "FREELANCER" | "CLIENT",
      },
    });

    // Create empty profile
    console.log("Creating profile for user:", user.id);
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
  } catch (error) {
    console.error("Error during signup:", error);
    logger.error("Error during signup", {
      error: error as Error,
      stack: (error as Error).stack,
      name: (error as Error).name,
      message: (error as Error).message,
    });
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
