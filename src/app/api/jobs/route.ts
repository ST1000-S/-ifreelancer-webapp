import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { logger } from "@/lib/logger";
import {
  Prisma,
  JobType,
  JobCategory,
  ExperienceLevel,
  JobStatus,
} from "@prisma/client";

// Define the enums locally since they're not exported by Prisma yet
export enum JobDuration {
  LESS_THAN_1_MONTH = "LESS_THAN_1_MONTH",
  ONE_TO_THREE_MONTHS = "ONE_TO_THREE_MONTHS",
  THREE_TO_SIX_MONTHS = "THREE_TO_SIX_MONTHS",
  MORE_THAN_6_MONTHS = "MORE_THAN_6_MONTHS",
}

export enum JobAvailability {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  FLEXIBLE = "FLEXIBLE",
}

const jobSchema = z.object({
  title: z.string().min(10).max(100),
  description: z.string().min(50).max(5000),
  type: z.nativeEnum(JobType),
  budget: z.number().min(1),
  skills: z.array(z.string()),
  category: z.nativeEnum(JobCategory),
  experienceLevel: z.nativeEnum(ExperienceLevel),
  duration: z.number().optional(),
});

// POST /api/jobs - Create a new job
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      logger.warn("Unauthorized job creation attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const validatedData = jobSchema.parse(data);

    const job = await prisma.job.create({
      data: {
        ...validatedData,
        creatorId: session.user.id,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        applications: {
          include: {
            applicant: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    logger.info("Job created", { jobId: job.id });

    return NextResponse.json(job);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    logger.error(
      "Error creating job",
      new Error(error instanceof Error ? error.message : "Unknown error")
    );
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
}

// GET /api/jobs - Get jobs with optional filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const type = searchParams.get("type") as JobType | null;
    const category = searchParams.get("category") as JobCategory | null;
    const experienceLevel = searchParams.get(
      "experienceLevel"
    ) as ExperienceLevel | null;
    const minBudget = searchParams.get("minBudget");
    const maxBudget = searchParams.get("maxBudget");
    const skills = searchParams.get("skills")?.split(",");
    const status = (searchParams.get("status") || "OPEN") as JobStatus;
    const creatorId = searchParams.get("creatorId");
    const location = searchParams.get("location");
    const duration = searchParams.get("duration")
      ? parseInt(searchParams.get("duration")!)
      : null;
    const sortBy = searchParams.get("sortBy") || "recent";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const where: Prisma.JobWhereInput = {
      ...(query && {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { skills: { hasSome: [query] } },
        ],
      }),
      ...(type && { type }),
      ...(category && { category }),
      ...(experienceLevel && { experienceLevel }),
      ...(minBudget && { budget: { gte: parseFloat(minBudget) } }),
      ...(maxBudget && { budget: { lte: parseFloat(maxBudget) } }),
      ...(skills?.length && { skills: { hasSome: skills } }),
      ...(location && { type: "REMOTE" }),
      ...(duration && { duration }),
      status,
      ...(creatorId && { creatorId }),
    };

    let orderBy: Prisma.JobOrderByWithRelationInput = { createdAt: "desc" };

    switch (sortBy) {
      case "budget_high":
        orderBy = { budget: "desc" };
        break;
      case "budget_low":
        orderBy = { budget: "asc" };
        break;
      case "applications":
        orderBy = { applications: { _count: "desc" } };
        break;
      case "rating":
        orderBy = { createdAt: "desc" }; // Fallback to recent as rating is not supported
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          applications: {
            include: {
              applicant: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    return NextResponse.json({
      jobs,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    logger.error(
      "Error fetching jobs",
      new Error(error instanceof Error ? error.message : "Unknown error")
    );
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      logger.warn("Unauthorized attempt to update job", {
        ip: req.headers.get("x-forwarded-for"),
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const { id, ...updateData } = data;

    // Check if job exists and user has permission
    const job = await prisma.job.findUnique({
      where: { id },
      select: { creatorId: true },
    });

    if (!job) {
      logger.warn("Update attempt for non-existent job", {
        jobId: id,
        userId: session.user.id,
      });
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.creatorId !== session.user.id) {
      logger.warn("Unauthorized job update attempt", {
        jobId: id,
        userId: session.user.id,
        creatorId: job.creatorId,
      });
      return NextResponse.json(
        { error: "You can only update your own job postings" },
        { status: 403 }
      );
    }

    const updatedJob = await prisma.job.update({
      where: { id },
      data: updateData,
    });

    logger.info("Job updated successfully", {
      jobId: id,
      userId: session.user.id,
      updates: Object.keys(updateData),
    });

    return NextResponse.json(updatedJob);
  } catch (error) {
    logger.error("Error updating job", error as Error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      logger.warn("Unauthorized attempt to delete job", {
        ip: req.headers.get("x-forwarded-for"),
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      logger.warn("Delete attempt without job ID", {
        userId: session.user.id,
      });
      return NextResponse.json(
        { error: "Job ID is required" },
        { status: 400 }
      );
    }

    // Check if job exists and user has permission
    const job = await prisma.job.findUnique({
      where: { id },
      select: { creatorId: true },
    });

    if (!job) {
      logger.warn("Delete attempt for non-existent job", {
        jobId: id,
        userId: session.user.id,
      });
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.creatorId !== session.user.id) {
      logger.warn("Unauthorized job deletion attempt", {
        jobId: id,
        userId: session.user.id,
        creatorId: job.creatorId,
      });
      return NextResponse.json(
        { error: "You can only delete your own job postings" },
        { status: 403 }
      );
    }

    await prisma.job.delete({
      where: { id },
    });

    logger.info("Job deleted successfully", {
      jobId: id,
      userId: session.user.id,
    });

    return NextResponse.json({ message: "Job deleted successfully" });
  } catch (error) {
    logger.error("Error deleting job", error as Error);
    return NextResponse.json(
      { error: "Failed to delete job" },
      { status: 500 }
    );
  }
}
