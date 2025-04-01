import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    // Extract search parameters
    const searchQuery = searchParams.get("q") || "";
    const skills = searchParams.get("skills")?.split(",") || [];
    const minBudget = parseInt(searchParams.get("minBudget") || "0");
    const maxBudget = parseInt(searchParams.get("maxBudget") || "10000");
    const durations = searchParams.get("duration")?.split(",") || [];
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sort = searchParams.get("sort") || "latest";

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build the query filter
    const filter: any = {
      status: "OPEN", // Only show open jobs
      budget: {
        gte: minBudget,
        lte: maxBudget,
      },
    };

    // Add title/description search if provided
    if (searchQuery) {
      filter.OR = [
        { title: { contains: searchQuery, mode: "insensitive" } },
        { description: { contains: searchQuery, mode: "insensitive" } },
      ];
    }

    // Add duration filter if provided
    if (durations.length > 0) {
      filter.duration = { in: durations };
    }

    // Define order based on sort parameter
    let orderBy: any = {};
    switch (sort) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "highestBudget":
        orderBy = { budget: "desc" };
        break;
      case "lowestBudget":
        orderBy = { budget: "asc" };
        break;
      case "latest":
      default:
        orderBy = { createdAt: "desc" };
    }

    // Get jobs with filters
    const jobs = await prisma.job.findMany({
      where: filter,
      include: {
        skills: {
          include: {
            skill: true,
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    // If skills filter is applied, we need to do post-processing
    // as prisma doesn't support filtering on many-to-many relations with specific conditions
    let filteredJobs = jobs;

    if (skills.length > 0) {
      filteredJobs = jobs.filter((job) => {
        const jobSkills = job.skills.map((s) => s.skill.name.toLowerCase());
        return skills.some((skill) => jobSkills.includes(skill.toLowerCase()));
      });
    }

    // Get total count for pagination
    const totalJobs = await prisma.job.count({
      where: filter,
    });

    // Format the response
    const formattedJobs = filteredJobs.map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      budget: job.budget,
      duration: job.duration,
      status: job.status,
      createdAt: job.createdAt,
      skills: job.skills.map((s) => ({
        id: s.skill.id,
        name: s.skill.name,
      })),
      postedBy: {
        id: job.client.id,
        name: job.client.name,
      },
    }));

    return NextResponse.json({
      jobs: formattedJobs,
      pagination: {
        total: totalJobs,
        page,
        limit,
        totalPages: Math.ceil(totalJobs / limit),
      },
    });
  } catch (error) {
    logger.error("Error in job search API:", error as Error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}
