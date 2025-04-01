import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { logger } from "@/lib/logger";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all profiles
    const profiles = await prisma.profile.findMany({
      select: {
        skills: true,
      },
    });

    // Extract and flatten all skills
    const allSkills = profiles.flatMap((profile) => profile.skills);

    // Remove duplicates and sort
    const uniqueSkills = Array.from(new Set(allSkills)).sort();

    // Format for response
    const formattedSkills = uniqueSkills.map((skill, index) => ({
      id: `skill-${index + 1}`,
      name: skill,
    }));

    return NextResponse.json(formattedSkills);
  } catch (error) {
    logger.error("Error fetching skills:", error as Error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
      { status: 500 }
    );
  }
}
