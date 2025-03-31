import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { logger } from "@/lib/logger";
import { Prisma } from "@prisma/client";

const profileSchema = z.object({
  title: z.string().min(5).max(100).optional(),
  bio: z.string().min(50).max(1000).optional(),
  skills: z.array(z.string()).optional(),
  availability: z.boolean().optional(),
  hourlyRate: z.number().min(0).optional(),
  location: z.string().min(2).max(100).optional(),
  languages: z.array(z.string()).optional(),
  phoneNumber: z.string().min(10).max(20).optional(),
  website: z.string().url().optional(),
  github: z.string().url().optional(),
  linkedin: z.string().url().optional(),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      logger.warn("Unauthorized profile fetch attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || session.user.id;

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
        portfolio: true,
        experience: true,
        education: true,
        certifications: true,
      },
    });

    if (!profile) {
      logger.warn("Profile not found");
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    const errorObj =
      error instanceof Error ? error : new Error("Unknown error");
    logger.error("Error fetching profile", errorObj);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      logger.warn("Unauthorized profile update attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const validatedData = profileSchema.parse(data);

    const updateData: Prisma.ProfileUpdateInput = {
      title: validatedData.title,
      bio: validatedData.bio,
      skills: validatedData.skills ? { set: validatedData.skills } : undefined,
      availability: validatedData.availability,
      hourlyRate: validatedData.hourlyRate,
      location: validatedData.location,
      languages: validatedData.languages
        ? { set: validatedData.languages }
        : undefined,
      phoneNumber: validatedData.phoneNumber,
      website: validatedData.website,
      github: validatedData.github,
      linkedin: validatedData.linkedin,
    };

    const profile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        title: validatedData.title,
        bio: validatedData.bio,
        skills: validatedData.skills || [],
        availability: validatedData.availability ?? true,
        hourlyRate: validatedData.hourlyRate,
        location: validatedData.location,
        languages: validatedData.languages || [],
        phoneNumber: validatedData.phoneNumber,
        website: validatedData.website,
        github: validatedData.github,
        linkedin: validatedData.linkedin,
      },
      update: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
          },
        },
        portfolio: true,
        experience: true,
        education: true,
        certifications: true,
      },
    });

    logger.info("Profile updated successfully");

    return NextResponse.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn("Invalid profile data", { errors: error.errors });
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    const errorObj =
      error instanceof Error ? error : new Error("Unknown error");
    logger.error("Error updating profile", errorObj);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
