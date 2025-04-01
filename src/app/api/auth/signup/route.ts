import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const { email, password, name, role } = await req.json();

    // Validate input
    if (!email || !password || !name || !role) {
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
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role as "FREELANCER" | "CLIENT",
      },
    });

    // Create empty profile
    await prisma.profile.create({
      data: {
        userId: user.id,
        skills: [],
        languages: [],
      },
    });

    logger.info("New user created successfully", {
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return NextResponse.json({ message: "User created successfully" });
  } catch (error) {
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
