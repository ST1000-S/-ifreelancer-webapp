import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { logger } from "@/lib/logger";
import {
  JobType,
  JobCategory,
  ExperienceLevel,
  JobStatus,
} from "@prisma/client";
import { JobFormData } from "@/types/job";

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
  title: z.string().min(1),
  description: z.string().min(1),
  type: z.nativeEnum(JobType),
  budget: z.number().min(0),
  category: z.nativeEnum(JobCategory),
  experienceLevel: z.nativeEnum(ExperienceLevel),
  duration: z.string().optional(),
  availability: z.boolean().optional(),
  location: z.string().optional(),
  skills: z.array(z.string()),
});

type WhereClause = {
  OR?: Array<{ [key: string]: any }>;
  type?: JobType;
  category?: JobCategory;
  experienceLevel?: ExperienceLevel;
  budget?: { gte?: number; lte?: number };
  skills?: { hasEvery: string[] };
  status?: JobStatus;
  creatorId?: string;
  location?: string;
  duration?: string;
};

type OrderByClause = {
  budget?: "asc" | "desc";
  createdAt?: "asc" | "desc";
};

// POST /api/jobs - Create a new job
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const json = await req.json();
    const body = jobSchema.parse(json);

    const job = await prisma.job.create({
      data: {
        ...body,
        creatorId: session.user.id,
        status: JobStatus.OPEN,
      },
    });

    return Response.json(job);
  } catch (error) {
    console.error("Error creating job:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

// GET /api/jobs - Get jobs with optional filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");
    const type = searchParams.get("type") as JobType;
    const category = searchParams.get("category") as JobCategory;
    const experienceLevel = searchParams.get(
      "experienceLevel"
    ) as ExperienceLevel;
    const minBudget = searchParams.get("minBudget");
    const maxBudget = searchParams.get("maxBudget");
    const skills = searchParams.get("skills")?.split(",");
    const status = searchParams.get("status") as JobStatus;
    const creatorId = searchParams.get("creatorId");
    const location = searchParams.get("location");
    const duration = searchParams.get("duration");
    const sortBy = searchParams.get("sortBy");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: WhereClause = {};

    if (query) {
      where.OR = [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    if (type) where.type = type;
    if (category) where.category = category;
    if (experienceLevel) where.experienceLevel = experienceLevel;
    if (minBudget) where.budget = { gte: parseFloat(minBudget) };
    if (maxBudget)
      where.budget = { ...where.budget, lte: parseFloat(maxBudget) };
    if (skills?.length) where.skills = { hasEvery: skills };
    if (status) where.status = status;
    if (creatorId) where.creatorId = creatorId;
    if (location) where.location = location;
    if (duration) where.duration = duration;

    const orderBy: OrderByClause = {};
    if (sortBy === "budget_asc") orderBy.budget = "asc";
    if (sortBy === "budget_desc") orderBy.budget = "desc";
    if (sortBy === "latest") orderBy.createdAt = "desc";
    if (sortBy === "oldest") orderBy.createdAt = "asc";

    const jobs = await prisma.job.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        creator: {
          select: {
            name: true,
            image: true,
          },
        },
        applications: {
          select: {
            id: true,
          },
        },
      },
    });

    const total = await prisma.job.count({ where });

    return Response.json({
      jobs,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return new Response("Internal Server Error", { status: 500 });
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
